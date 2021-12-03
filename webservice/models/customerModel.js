module.exports = (sequelize, type) => {
  const Customer = sequelize.define("customer", {
    id: {
      type: type.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: type.STRING
    },
    email: {
      type: type.STRING,
      validate: {
        isEmail: true,   
      }
    },
    address: {
      type: type.STRING
    },
    createdAt: {
      type: type.DATE
    },
    updatedAt: {
      type: type.DATE
    },
    blockHeight: {
      type: type.BIGINT
    }
  });

  return Customer;
};    