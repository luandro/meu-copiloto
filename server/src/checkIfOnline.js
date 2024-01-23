const dns = require("dns");

const checkIfOnline = () => {
  return new Promise((resolve) => {
    dns.lookup("google.com", (err) => {
      resolve(!err);
    });
  });
};

module.exports = checkIfOnline;
