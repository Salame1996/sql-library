'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Book extends Model {
    static associate(models) {
      // define association here
    }
  }

  // Initialize the model with properties and validations
  Book.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false, // Prevent null values
      validate: {
        notEmpty: {
          msg: 'Title cannot be empty' // Custom error message
        }
      }
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false, // Prevent null values
      validate: {
        notEmpty: {
          msg: 'Author cannot be empty' // Custom error message
        }
      }
    },
    genre: DataTypes.STRING,
    year: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Book',
  });

  return Book;
};
