const UserEntity = require('../1_domain/UserEntity');

class RegisterUserUseCase{
    /**
     * @param {Object} userRepository
     * @param {Object} passwordHasher
     */

    constructor({userRepository, passwordHasher}){
        this.userRepository = userRepository;
        this.passwordHasher = passwordHasher;
    }

    async execute({name, email, password, role}){
        const existingUser = await this.userRepository.findByEmail(email)
        if(existingUser){
            throw Error('Use Case Violation: Email already registered');
        }

        const hashedPassword = await this.passwordHasher.hash(password);

        const UserEntity = new UserEntity({
            name, 
            email,
            password: hashedPassword,
            role
        })

        const savedUser = await this.userRepository.save(UserEntity);

        return {
            id: savedUser.id,
            name: savedUser.email,
            email: savedUser.email,
            role: savedUser.role
        };

    }
}

module.exports = RegisterUserUseCase;