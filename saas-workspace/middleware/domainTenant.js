const Workspace = require('../models/Workspace');

exports.resolveTenantDomain = async (req, res, next) => {
  try {
    // Extract host header (e.g. "acme.donglify.com", "acme.localhost:5005", or "docs.acmecorp.com")
    const hostHeader = (req.headers.host || '').split(':')[0].toLowerCase(); // Remove port if present
    const APEX_DOMAIN = (process.env.APEX_DOMAIN || 'localhost').toLowerCase();

    let workspace = null;

    // -----------------------------------------------------------------------
    // PRIORITY 1: CHECK FOR CUSTOM DOMAIN (e.g., "docs.acmecorp.com")
    // -----------------------------------------------------------------------
    if (hostHeader && !hostHeader.includes(APEX_DOMAIN)) {
      workspace = await Workspace.findOne({ customDomain: hostHeader });
    }

    // -----------------------------------------------------------------------
    // PRIORITY 2: CHECK FOR SUBDOMAIN SLUG (e.g., "acme.localhost" or "acme.donglify.com")
    // -----------------------------------------------------------------------
    if (!workspace && hostHeader.includes('.')) {
      const parts = hostHeader.split('.');
      
      // If host is "acme.localhost" or "acme.donglify.com", parts[0] is "acme"
      if (parts.length >= 2) {
        const potentialSlug = parts[0];
        
        // Ignore generic root subdomains like 'www', 'api', 'app'
        if (!['www', 'api', 'app', 'localhost'].includes(potentialSlug)) {
          workspace = await Workspace.findOne({ slug: potentialSlug });
        }
      }
    }

    // -----------------------------------------------------------------------
    // PRIORITY 3: FALLBACK TO EXPLICIT X-WORKSPACE-ID HEADER
    // -----------------------------------------------------------------------
    if (!workspace) {
      const workspaceIdHeader = req.headers['x-workspace-id'];
      if (workspaceIdHeader) {
        workspace = await Workspace.findById(workspaceIdHeader);
      }
    }

    // Attach resolved workspace context to request object if found
    if (workspace) {
      req.workspace = workspace;
      req.workspaceId = workspace._id.toString();
      // Ensure header is set downstream for compatibility
      req.headers['x-workspace-id'] = workspace._id.toString();
    }

    next();
  } catch (error) {
    console.error('Domain Resolver Error:', error.message);
    next();
  }
};