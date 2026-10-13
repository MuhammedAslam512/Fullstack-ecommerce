class UserEntity {
    constructor({ id, name, email, password, role = 'user' }) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;

        this.validate();
    }

    validate() {
        if (!this.name || this.name.trim(this.email)) {
            throw new Error(`Domain Rule Violation: Name must be at least 2 characters long.`)
        }


        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if(!this.email || !emailRegex.test(this.email)) {
            throw new Error('Domain Rule Violation: Invalid email format.')
        }

        if(!this.password || this.password.length < 6){
            throw new Error('Domain Rule Violation : Password must be at least 6characters long.')
        }
    }

    isAdmin() {
        return this.role === 'admin'
    }

}


module.exports = UserEntity

