// const Post = require('../models/Post');
// const APIFeatures = require('../utils/apiFeatures');

// // ─────────────────────────────────────────
// // GET ALL POSTS - with all features!
// // GET /api/posts?page=1&limit=10&sort=-createdAt
// // ─────────────────────────────────────────
// const getAllPosts = async (req, res) => {
//   try {
//     // Count total (for pagination info)
//     const total = await Post.countDocuments();

//     // Use API Features!
//     const features = new APIFeatures(Post.find(), req.query)
//       .filter()
//       .search(['title', 'content'])   // search in title & content
//       .sort()
//       .limitFields()
//       .paginate();

//     // Execute query with populate
//     const posts = await features.query.populate('author', 'name email');

//     // Pagination info
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const totalPages = Math.ceil(total / limit);

//     res.status(200).json({
//       success: true,
//       count: posts.length,
//       pagination: {
//         currentPage: page,
//         totalPages,
//         totalPosts: total,
//         hasNextPage: page < totalPages,
//         hasPrevPage: page > 1,
//         limit
//       },
//       data: posts
//     });

//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // ── GET MY POSTS ──────────────────────────
// const getMyPosts = async (req, res) => {
//   try {
//     const posts = await Post.find({ author: req.user.id })
//       .sort('-createdAt');

//     res.status(200).json({
//       success: true,
//       count: posts.length,
//       data: posts
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // ── CREATE POST ───────────────────────────
// const createPost = async (req, res) => {
//   try {
//     const { title, content } = req.body;

//     const post = await Post.create({
//       title,
//       content,
//       author: req.user.id
//     });

//     res.status(201).json({
//       success: true,
//       message: 'Post created! ✅',
//       data: post
//     });
//   } catch (error) {
//     if (error.name === 'ValidationError') {
//       const messages = Object.values(error.errors).map(err => err.message);
//       return res.status(400).json({
//         success: false,
//         message: messages.join(', ')
//       });
//     }
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // ── UPDATE POST ───────────────────────────
// const updatePost = async (req, res) => {
//   try {
//     let post = await Post.findById(req.params.id);

//     if (!post) {
//       return res.status(404).json({
//         success: false,
//         message: 'Post not found!'
//       });
//     }

//     if (post.author.toString() !== req.user.id.toString()) {
//       return res.status(403).json({
//         success: false,
//         message: '❌ You can only update YOUR posts!'
//       });
//     }

//     post = await Post.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//       runValidators: true
//     });

//     res.status(200).json({
//       success: true,
//       message: 'Post updated! ✅',
//       data: post
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // ── DELETE POST ───────────────────────────
// const deletePost = async (req, res) => {
//   try {
//     const post = await Post.findById(req.params.id);

//     if (!post) {
//       return res.status(404).json({
//         success: false,
//         message: 'Post not found!'
//       });
//     }

//     if (
//       post.author.toString() !== req.user.id.toString() &&
//       req.user.role !== 'admin'
//     ) {
//       return res.status(403).json({
//         success: false,
//         message: '❌ You can only delete YOUR posts!'
//       });
//     }

//     await Post.findByIdAndDelete(req.params.id);

//     res.status(200).json({
//       success: true,
//       message: 'Post deleted! ✅'
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// module.exports = {
//   getAllPosts,
//   getMyPosts,
//   createPost,
//   updatePost,
//   deletePost
// };







const Post = require('../models/Post');

// ─────────────────────────────────────────
// GET ALL POSTS
// With pagination, search, sort
// ─────────────────────────────────────────
const getAllPosts = async (req, res) => {
  try {
    // ── PAGINATION ──────────────────────
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // ── SEARCH ──────────────────────────
    let filter = {};
    if (req.query.search) {
      const regex = new RegExp(req.query.search, 'i');
      filter = {
        $or: [
          { title: regex },
          { content: regex }
        ]
      };
    }

    // ── SORTING ─────────────────────────
    const sort = req.query.sort || '-createdAt';

    // ── GET POSTS ───────────────────────
    const posts = await Post.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('author', 'name email');

    // ── COUNT TOTAL ─────────────────────
    const total = await Post.countDocuments(filter);

    // ── SEND RESPONSE ───────────────────
    res.status(200).json({
      success: true,
      count: posts.length,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalPosts: total
      },
      data: posts
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ── GET MY POSTS ──────────────────────────
const getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user.id })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ── CREATE POST ───────────────────────────
const createPost = async (req, res) => {
  try {
    const { title, content } = req.body;

    const post = await Post.create({
      title,
      content,
      author: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Post created! ✅',
      data: post
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ── UPDATE POST ───────────────────────────
const updatePost = async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found!'
      });
    }

    if (post.author.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: '❌ You can only update YOUR posts!'
      });
    }

    post = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Post updated! ✅',
      data: post
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ── DELETE POST ───────────────────────────
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found!'
      });
    }

    if (
      post.author.toString() !== req.user.id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: '❌ You can only delete YOUR posts!'
      });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Post deleted! ✅'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getAllPosts,
  getMyPosts,
  createPost,
  updatePost,
  deletePost
};