const categ = require('./../models/Pcategorie.schema')
const AppError = require('./../middleware/errorHandler');
let e = new AppError('_', 0);



exports.addCategory = async (req, res, next) => {
    try {
        const newCat = await categ.create({
            name: req.body.name,
            description: req.body.description,
        })
        res.status(201).send(newCat);

    } catch (error) {
        e.message = 'Error adding new category';
        e.statusCode = 400;
        return next(e);
    }
};
exports.getAllCategory = async (req, res, next) => {
    try {
        const allCategories = await categ.find();
        res.status(200).send(allCategories);
    } catch (err) {
        e.message = 'Error getting all categories';
        e.statusCode = 500;
        return next(e);
    }

};

exports.getOneCategory = async (req, res, next) => {
    try {
        const category = await categ.findById(req.params.id);
        if (!category) next(new AppError('no category found with that id', 404));

        res.status(200).json({ category });
    } catch (err) {
        e.message = 'Error deleting this category';
        e.statusCode = 500;
        return next(e);
    }
};

exports.deletedCategory = async (req, res, next) => {
    try {
        const cat = await categ.findByIdAndDelete(req.params.id);
        if (!cat) return next(new AppError('no category found with that id', 404));

        res.status(200).send("category deleted successfully");
    } catch (err) {
        e.message = 'Error deleting this category';
        e.statusCode = 500;
        return next(e);
    }
}

exports.updateCateg = async (req, res, next) => {
    try {

        const categUpdated = await categ.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!categUpdated) return next(new AppError('no category found with that id', 404));

        res.status(200).send(categUpdated);

    } catch (err) {
        res.status(500).send(err);
    }


};
