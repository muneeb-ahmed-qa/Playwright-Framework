const { PasswordEncryptionHelper } = require('./passwordEncryption');

/**
 * Test Data Generator Utility
 * Provides methods to generate realistic test data for various scenarios
 */
class TestDataGenerator {
    constructor() {
        this.passwordHelper = new PasswordEncryptionHelper();
        this.firstNames = [
            'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Jessica',
            'William', 'Ashley', 'James', 'Amanda', 'Christopher', 'Jennifer', 'Daniel',
            'Lisa', 'Matthew', 'Nancy', 'Anthony', 'Karen', 'Mark', 'Betty', 'Donald',
            'Helen', 'Steven', 'Sandra', 'Paul', 'Donna', 'Andrew', 'Carol'
        ];

        this.lastNames = [
            'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
            'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
            'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
            'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark',
            'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King'
        ];

        this.domains = [
            'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'example.com',
            'test.com', 'demo.com', 'sample.com', 'company.com', 'business.com'
        ];

        this.companies = [
            'Acme Corp', 'Tech Solutions', 'Global Systems', 'Innovation Labs',
            'Digital Dynamics', 'Future Technologies', 'Smart Solutions',
            'Advanced Systems', 'NextGen Corp', 'Progressive Tech'
        ];

        this.jobTitles = [
            'Software Engineer', 'Product Manager', 'UX Designer', 'Data Analyst',
            'Marketing Specialist', 'Sales Representative', 'Project Manager',
            'Business Analyst', 'Quality Assurance', 'DevOps Engineer'
        ];

        this.departments = [
            'Engineering', 'Marketing', 'Sales', 'Human Resources', 'Finance',
            'Operations', 'Customer Support', 'Product Management', 'Design',
            'Research and Development'
        ];

        this.countries = [
            'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany',
            'France', 'Japan', 'Brazil', 'India', 'China'
        ];

        this.cities = [
            'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix',
            'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'
        ];

        this.states = [
            'California', 'Texas', 'Florida', 'New York', 'Pennsylvania',
            'Illinois', 'Ohio', 'Georgia', 'North Carolina', 'Michigan'
        ];
    }

    /**
     * Generate a random first name
     * @returns {string} Random first name
     */
    generateFirstName() {
        return this.firstNames[Math.floor(Math.random() * this.firstNames.length)];
    }

    /**
     * Generate a random last name
     * @returns {string} Random last name
     */
    generateLastName() {
        return this.lastNames[Math.floor(Math.random() * this.lastNames.length)];
    }

    /**
     * Generate a random full name
     * @returns {string} Random full name
     */
    generateFullName() {
        return `${this.generateFirstName()} ${this.generateLastName()}`;
    }

    /**
     * Generate a random email address
     * @param {string} firstName - First name for email
     * @param {string} lastName - Last name for email
     * @returns {string} Random email address
     */
    generateEmail(firstName = null, lastName = null) {
        const first = firstName || this.generateFirstName().toLowerCase();
        const last = lastName || this.generateLastName().toLowerCase();
        const domain = this.domains[Math.floor(Math.random() * this.domains.length)];
        const randomNumber = Math.floor(Math.random() * 1000);
        
        return `${first}.${last}${randomNumber}@${domain}`;
    }

    /**
     * Generate a random phone number
     * @param {string} countryCode - Country code (default: +1)
     * @returns {string} Random phone number
     */
    generatePhoneNumber(countryCode = '+1') {
        const areaCode = Math.floor(Math.random() * 900) + 100;
        const exchange = Math.floor(Math.random() * 900) + 100;
        const number = Math.floor(Math.random() * 9000) + 1000;
        
        return `${countryCode} (${areaCode}) ${exchange}-${number}`;
    }

    /**
     * Generate a random company name
     * @returns {string} Random company name
     */
    generateCompanyName() {
        return this.companies[Math.floor(Math.random() * this.companies.length)];
    }

    /**
     * Generate a random job title
     * @returns {string} Random job title
     */
    generateJobTitle() {
        return this.jobTitles[Math.floor(Math.random() * this.jobTitles.length)];
    }

    /**
     * Generate a random department
     * @returns {string} Random department
     */
    generateDepartment() {
        return this.departments[Math.floor(Math.random() * this.departments.length)];
    }

    /**
     * Generate a random address
     * @returns {Object} Random address object
     */
    generateAddress() {
        const streetNumber = Math.floor(Math.random() * 9999) + 1;
        const streetNames = [
            'Main St', 'Oak Ave', 'First St', 'Second St', 'Park Ave',
            'Elm St', 'Pine St', 'Cedar Ave', 'Maple St', 'Washington St'
        ];
        const streetName = streetNames[Math.floor(Math.random() * streetNames.length)];
        const city = this.cities[Math.floor(Math.random() * this.cities.length)];
        const state = this.states[Math.floor(Math.random() * this.states.length)];
        const zipCode = Math.floor(Math.random() * 90000) + 10000;

        return {
            street: `${streetNumber} ${streetName}`,
            city: city,
            state: state,
            zipCode: zipCode.toString(),
            country: 'United States'
        };
    }

    /**
     * Generate a random date
     * @param {Date} startDate - Start date (default: 1 year ago)
     * @param {Date} endDate - End date (default: today)
     * @returns {Date} Random date
     */
    generateDate(startDate = null, endDate = null) {
        const start = startDate || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        const end = endDate || new Date();
        const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
        
        return new Date(randomTime);
    }

    /**
     * Generate a random date string in YYYY-MM-DD format
     * @param {Date} startDate - Start date
     * @param {Date} endDate - End date
     * @returns {string} Random date string
     */
    generateDateString(startDate = null, endDate = null) {
        const date = this.generateDate(startDate, endDate);
        return date.toISOString().split('T')[0];
    }

    /**
     * Generate a random age
     * @param {number} minAge - Minimum age (default: 18)
     * @param {number} maxAge - Maximum age (default: 65)
     * @returns {number} Random age
     */
    generateAge(minAge = 18, maxAge = 65) {
        return Math.floor(Math.random() * (maxAge - minAge + 1)) + minAge;
    }

    /**
     * Generate a random salary
     * @param {number} minSalary - Minimum salary (default: 30000)
     * @param {number} maxSalary - Maximum salary (default: 150000)
     * @returns {number} Random salary
     */
    generateSalary(minSalary = 30000, maxSalary = 150000) {
        return Math.floor(Math.random() * (maxSalary - minSalary + 1)) + minSalary;
    }

    /**
     * Generate a random password
     * @param {number} length - Password length (default: 12)
     * @param {Object} options - Password options
     * @returns {string} Random password
     */
    generatePassword(length = 12, options = {}) {
        const {
            includeUppercase = true,
            includeLowercase = true,
            includeNumbers = true,
            includeSymbols = true
        } = options;

        let charset = '';
        if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
        if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (includeNumbers) charset += '0123456789';
        if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

        let password = '';
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }

        return password;
    }

    /**
     * Generate a random UUID
     * @returns {string} Random UUID
     */
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * Generate a random color
     * @returns {string} Random hex color
     */
    generateColor() {
        return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    }

    /**
     * Generate a random sentence
     * @param {number} wordCount - Number of words (default: 10)
     * @returns {string} Random sentence
     */
    generateSentence(wordCount = 10) {
        const words = [
            'the', 'quick', 'brown', 'fox', 'jumps', 'over', 'lazy', 'dog',
            'hello', 'world', 'test', 'data', 'generation', 'automation',
            'quality', 'assurance', 'software', 'development', 'testing'
        ];

        let sentence = '';
        for (let i = 0; i < wordCount; i++) {
            const word = words[Math.floor(Math.random() * words.length)];
            sentence += (i === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word) + ' ';
        }

        return sentence.trim() + '.';
    }

    /**
     * Generate a random paragraph
     * @param {number} sentenceCount - Number of sentences (default: 3)
     * @returns {string} Random paragraph
     */
    generateParagraph(sentenceCount = 3) {
        let paragraph = '';
        for (let i = 0; i < sentenceCount; i++) {
            paragraph += this.generateSentence() + ' ';
        }
        return paragraph.trim();
    }

    /**
     * Generate a random boolean value
     * @returns {boolean} Random boolean
     */
    generateBoolean() {
        return Math.random() < 0.5;
    }

    /**
     * Generate a random number
     * @param {number} min - Minimum value (default: 0)
     * @param {number} max - Maximum value (default: 100)
     * @returns {number} Random number
     */
    generateNumber(min = 0, max = 100) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Generate a random array element
     * @param {Array} array - Array to select from
     * @returns {*} Random array element
     */
    generateArrayElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    /**
     * Generate a random subset of an array
     * @param {Array} array - Array to select from
     * @param {number} count - Number of elements to select
     * @returns {Array} Random subset
     */
    generateArraySubset(array, count) {
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    /**
     * Generate user data object
     * @param {Object} overrides - Data overrides
     * @returns {Object} Complete user data object
     */
    generateUserData(overrides = {}) {
        const firstName = this.generateFirstName();
        const lastName = this.generateLastName();
        const address = this.generateAddress();

        return {
            firstName,
            lastName,
            fullName: `${firstName} ${lastName}`,
            email: this.generateEmail(firstName, lastName),
            phone: this.generatePhoneNumber(),
            age: this.generateAge(),
            address: address,
            company: this.generateCompanyName(),
            jobTitle: this.generateJobTitle(),
            department: this.generateDepartment(),
            salary: this.generateSalary(),
            ...overrides
        };
    }

    /**
     * Generate form data object
     * @param {Object} overrides - Data overrides
     * @returns {Object} Complete form data object
     */
    generateFormData(overrides = {}) {
        const userData = this.generateUserData();
        
        return {
            name: userData.fullName,
            email: userData.email,
            phone: userData.phone,
            message: this.generateParagraph(2),
            agreeToTerms: this.generateBoolean(),
            newsletter: this.generateBoolean(),
            ...overrides
        };
    }

    /**
     * Generate test data for specific scenarios
     * @param {string} scenario - Test scenario name
     * @returns {Object} Scenario-specific test data
     */
    generateScenarioData(scenario) {
        switch (scenario) {
            case 'login':
                return {
                    validUser: {
                        username: 'testuser@example.com',
                        password: 'password123'
                    },
                    invalidUser: {
                        username: 'invalid@example.com',
                        password: 'wrongpassword'
                    }
                };

            case 'registration':
                return this.generateUserData({
                    password: this.generatePassword(12),
                    confirmPassword: this.generatePassword(12),
                    agreeToTerms: true
                });

            case 'contact':
                return this.generateFormData({
                    subject: this.generateArrayElement(['General Inquiry', 'Support', 'Sales', 'Partnership']),
                    priority: this.generateArrayElement(['Low', 'Medium', 'High', 'Urgent'])
                });

            case 'ecommerce':
                return {
                    product: {
                        name: this.generateArrayElement(['Laptop', 'Phone', 'Tablet', 'Headphones']),
                        price: this.generateNumber(50, 2000),
                        quantity: this.generateNumber(1, 5)
                    },
                    shipping: this.generateAddress(),
                    payment: {
                        cardNumber: '4111111111111111',
                        expiryDate: '12/25',
                        cvv: '123'
                    }
                };

            default:
                return this.generateUserData();
        }
    }

    /**
     * Generate encrypted user data
     * @param {Object} overrides - Data overrides
     * @returns {Object} User data with encrypted sensitive fields
     */
    generateEncryptedUserData(overrides = {}) {
        const userData = this.generateUserData(overrides);
        return this.passwordHelper.encryptCredentials(userData);
    }

    /**
     * Generate encrypted form data
     * @param {Object} overrides - Data overrides
     * @returns {Object} Form data with encrypted sensitive fields
     */
    generateEncryptedFormData(overrides = {}) {
        const formData = this.generateFormData(overrides);
        return this.passwordHelper.encryptCredentials(formData);
    }

    /**
     * Generate encrypted test data for specific scenarios
     * @param {string} scenario - Test scenario name
     * @returns {Object} Encrypted scenario-specific test data
     */
    generateEncryptedScenarioData(scenario) {
        const scenarioData = this.generateScenarioData(scenario);
        return this.passwordHelper.encryptSensitiveFields(scenarioData);
    }

    /**
     * Generate secure test users with encrypted credentials
     * @param {number} count - Number of users to generate
     * @param {Object} options - Generation options
     * @returns {Array} Array of encrypted user objects
     */
    generateSecureTestUsers(count = 5, options = {}) {
        const users = [];
        const roles = ['admin', 'user', 'guest', 'moderator'];
        
        for (let i = 0; i < count; i++) {
            const user = this.generateUserData({
                role: roles[i % roles.length],
                password: this.generatePassword(12, {
                    includeUppercase: true,
                    includeLowercase: true,
                    includeNumbers: true,
                    includeSymbols: true
                }),
                apiKey: this.generateUUID(),
                token: this.generateUUID(),
                ...options
            });
            
            // Encrypt sensitive fields
            const encryptedUser = this.passwordHelper.encryptCredentials(user);
            users.push(encryptedUser);
        }
        
        return users;
    }

    /**
     * Generate test data with password policy validation
     * @param {Object} policy - Password policy rules
     * @returns {Object} Test data with policy-compliant passwords
     */
    generateDataWithPasswordPolicy(policy = {}) {
        const validator = this.passwordHelper.createPasswordValidator(policy);
        let password;
        let attempts = 0;
        const maxAttempts = 100;
        
        // Generate password that meets policy requirements
        do {
            password = this.generatePassword(12, {
                includeUppercase: policy.requireUppercase !== false,
                includeLowercase: policy.requireLowercase !== false,
                includeNumbers: policy.requireNumbers !== false,
                includeSymbols: policy.requireSymbols !== false
            });
            attempts++;
        } while (!validator(password).isValid && attempts < maxAttempts);
        
        if (attempts >= maxAttempts) {
            throw new Error('Could not generate password that meets policy requirements');
        }
        
        return this.generateUserData({ password });
    }
}

module.exports = { TestDataGenerator };
