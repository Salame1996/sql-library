const express = require('express');
const router = express.Router();
const SqlOp = require('sequelize').Op;
const Book = require('../models').Book;

const pageSize = 5;

function status_500_params(message) {
	return { status: 500, message: message, title: "Server Error" };
}

function response_status_params(res) {
	return { status: res.statusCode, message: res.statusMessage, title: "Server Error" };
}

router.get('/books/new', (req, res, next) => {
	res.render('new-book', { book: Book.build(), title: 'New Book' });
});

router.post('/books/new', (req, res) => {
	Book.create(req.body)
		.then(() => res.redirect('/books'))
		.catch(err => {
			if (err.name === "SequelizeValidationError") {
				var book = Book.build(req.body);
				book.id = req.params.id;
				res.render('new-book', { book: book, title: 'New Book', errors: err.errors });
			} else {
				res.render('error', status_500_params(err));
			}
		});
});

router.get('/books/:id', (req, res, next) => {
	Book.findByPk(req.params.id).then(book => {
		if (book) {
			return res.render('update-book', { book: book, title: book.title });
		} else {
			next();
		}
	});
});

router.post('/books/:id/delete', (req, res) => {
	Book.findByPk(req.params.id)
		.then(book => {
			if (book) {
				book.destroy();
			} else {
				res.render('error', response_status_params(res));
			}
		})
		.then(() => res.redirect('/books'))
		.catch(err => {
			res.render('error', status_500_params(err));
		});
});

router.post('/books/:id', (req, res) => {
	Book.findByPk(req.params.id)
		.then(book => book.update(req.body))
		.then(book => {
			if (book) {
				res.redirect('/books');
			} else {
				res.render('error', response_status_params(res));
			}
		})
		.catch(err => {
			if (err.name === "SequelizeValidationError") {
				var book = Book.build(req.body);
				book.id = req.params.id;
				res.render('update-book', { book: book, title: book.title, errors: err.errors });
			} else {
				res.render('error', status_500_params(err));
			}
		});
});

router.get('/books', (req, res) => {
	var page = parseInt(req.query.p);
	var search = req.query.s;

	var findOpts = {};
	if (isNaN(page)) { page = 1; }
	findOpts.offset = (page - 1) * pageSize;
	findOpts.limit = pageSize;

	if (search != undefined) {
		const searchEx = `%${search}%`;
		findOpts.where = {
			[SqlOp.or]: [
				{ title: { [SqlOp.like]: searchEx } },
				{ author: { [SqlOp.like]: searchEx } },
				{ genre: { [SqlOp.like]: searchEx } },
				{ year: { [SqlOp.like]: searchEx } }
			]
		};
	}

	Book.findAll(findOpts).then(books => {
		var renderOpts = { books: books, title: 'Books' };
		renderOpts.search = search || '';
		if (page > 1) { renderOpts.prevPage = page - 1; }
		if (books.length == pageSize) { renderOpts.nextPage = page + 1; }

		res.render('index', renderOpts);
	});
});

module.exports = router;
