const joi = require("joi");

const adminSchema = joi.object({
    adminName: joi.string().required(),
    hostelName: joi.string().required(),
    password: joi.string().required(),
});

const studentSchema = joi.object({
    studentName: joi.string().required(),
    studentId: joi.number().required(),
    roomNumber: joi.number().min(1).max(599).required(),
    password: joi.string().required(),
});

const commentSchema = joi.object({
        post: joi.string().required(),
        hostelName: joi.string().required(),
        comment: joi.string().required(),
});

const feedbackSchema = joi.object({
        mealType: joi.string().required(),
        rating: joi.number().required().min(1).max(5),
        comment: joi.string().required().max(500),
        studentId: joi.string().required(),
        password: joi.string().required(),
});

module.exports = {
    adminSchema,
    studentSchema,
    commentSchema,
    feedbackSchema
};
