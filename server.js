var mysql = require("mysql");
var inquirer = require("inquirer");
const cTable = require('console.table');
const colors = require('colors');

// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "Joker&voldy2019",
  database: "employee_DB"
});

connection.connect((err) => {
  if (err) throw err;
  console.log("connected as id " + connection.threadId + "\n");
  start(); 
});

function start() {
    inquirer.prompt({
        name: "start",
        type:"rawlist",
        message: "What would you like to do?",
        choices: [
            "View All Employees",
            "View All Employees by Department",
            "View All Employees by Manager",
            "View All Departments",
            "View All Roles",
            "Add Department",
            "Add Role",
            "Add Employee",
            "Remove Department",
            "Remove Role",
            "Remove Employee",
            "Update Employee Role",
            "Update Employee Manager",
            "View the total utilized budget of a department",
            "EXIT"
        ]
    }).then(function (answer) {
        switch(answer.start) {
            case "View All Employees":
                viewAllEmployees();
                break;

            case "View All Employees by Department":
                employeeByDepartment();
                break;

            case "View All Employees by Manager":
                employeeByManager();
                break;

            case "View All Departments":
                allDepartment();
                break;

            case "View All Roles":
                allRoles();
                break;

            case "Add Department":
                addDepartment();
                break;

            case "Add Role":
                addRole();
                break;

            case "Add Employee":
                addNewEmployee();
                break;

            case "Remove Department":
                removeDepartment();
                break;

            case "Remove Role":
                removeRole();
                break;
            
            case "Remove Employee":
                removeEmployee();
                break;

            case "Update Employee Role":
                updateRole();
                break;

            case "Update Employee Manager":
                updateManager();
                break;

            case "View the total utilized budget of a department":
                budgetOfDepartment();
                break;

            case "EXIT":
                console.table("Thanks for using the Employee Tracker!")
                connection.end();
                break;

            default:
                return "There is no way out!"
            

            
        }
    });
}

const viewAllEmployees = () => {
    var query = "SELECT employees.id, employees.first_name, employees.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM employees";
    query += " LEFT JOIN role on employees.role_id = role.id";
    query += " LEFT JOIN department on role.department_id = department.id";
    query += " LEFT JOIN employees manager on manager.id = employees.manager_id";
    connection.query(query, function (err, res) {
        if (err) throw err;
        console.log("ALL Employees View".green)
        console.table(res);
        start();
    });
};

function employeeByDepartment() {
    inquirer.prompt({
        name: "department",
        type: "list",
        message: "By which department would you like to view the employees?",
        choices: [
            "Sales", 
            "Engineering",
            "Finance",
            "Marketing"
        ]
    }).then(function (answer) {
        var query = `SELECT employees.id, CONCAT(employees.first_name, " ", employees.last_name) AS Fullname, department.name AS department
        FROM employees
        LEFT JOIN role on employees.role_id = role.id
        LEFT JOIN department on role.department_id = department.id
        WHERE department.name ="${answer.department}"`;
        connection.query(query, function (err, res) {
            if(err) throw err;
            console.log("All Employees by Department".green)
            console.table(res);
            start();
        });
    })
};

function employeeByManager() {
    connection.query(`SELECT CONCAT(m.first_name, " ", m.last_name) AS Manager, m.id FROM employees INNER JOIN employees m ON employees.manager_id = m.id`, function (err, res) {
       inquirer.prompt({
           name: "manager_id",
           type: "list",
           message: "By which Manager would you like to view the employees?",
           choices: res.map(o => ({ name: o.Manager, value: o.id }))

       }).then(function (answer) {
           var query = `SELECT employees.id, CONCAT(first_name, " ", last_name) AS Name, role.title
           FROM employees INNER JOIN role ON employees.role_id = role.id
           WHERE employees.manager_id = ${answer.manager_id} GROUP BY employees.id`;
           connection.query(query,
            function (err, result) {
                if (err) throw err;
                console.log("Employees by Manager".green)
                console.table(result);
                start();
            });
       })
    });
}

function allDepartment() {
    var query = "SELECT * FROM department";
    connection.query(query, function(err, res) {
        if (err) throw err;
        console.log("All departments".magenta)
        console.table(res);
        start();
    });
}

function allRoles() {
    var query = `SELECT role.id,role.title, role.salary, department.name AS Department
    FROM role
    LEFT JOIN department ON department.id =role.department_id
    ORDER BY role.id `;
    connection.query(query, function (err, res) {
        if (err) throw err;
        console.log("All Roles".magenta)
        console.table(res);
        start();
    });
}

function addDepartment() {
    inquirer.prompt([{
        message: "What department would you like to add?",
        type: "input",
        name: "newDepartment"
    }]).then(answer => {
        connection.query(`INSERT INTO department (name) VALUES ("${answer.newDepartment}")`, function (err, res) {
            if (err) throw err;
            console.log(`Department ${answer.newDepartment} has been successfully added`.yellow);
            start();
        });
    })
}

function addRole() {
    connection.query("SELECT * FROM department", function (req, res) {
        inquirer.prompt([{
            message: "What is the new Role Title?",
            type: "input",
            name: "newTitle"
        }, {
            message: "What is the salary for this role?",
            type: "input",
            name: "newSalary"
        }, {
            message: "To which department would you like to assign this new role?",
            type: "list",
            name: "roleDepartID",
            choices: res.map(item => ({ name: item.name, value: item.id }))

        }]).then(answer => {
            connection.query(`INSERT INTO role(title, salary, department_id) VALUES ('${answer.newTitle}', '${answer.newSalary}', ${answer.roleDepartID})`, function (err, res) {
                if (err) throw err;
                console.log(`New role has been successfully added`.yellow);
                start();
            });
        });
    });
}

function addNewEmployee() {
    connection.query(`SELECT CONCAT(first_name, " ", last_name) AS Manager, id FROM employees`, function (err, res) {
        connection.query(`SELECT DISTINCT title, id from role`, function (err, data) {
            inquirer.prompt([{
                message: "What is the employee's first name?",
                type: "input",
                name: "first_name"
            }, {
                message: "What is the employee's last name?",
                type: "input",
                name: "last_name"
            }, {
                message: "What is the employee's role?",
                type: "list",
                name: 'role_id',
                choices: data.map(o => ({ name: o.title, value: o.id }))

            }, {
                message: "Who will be this employee's Manager?",
                type: "list",
                name: 'manager_id',
                choices: res.map(o => ({ name: o.Manager, value: o.id }))

            }]).then(answer => {
                connection.query(`INSERT INTO employees(first_name, last_name, role_id, manager_id) VALUES ('${answer.first_name}', '${answer.last_name}', ${answer.role_id}, ${answer.manager_id})`, function (err, res) {
                    if (err) throw err;
                    console.log("------------")
                    console.log(`Employee ${answer.first_name} ${answer.last_name} has been successfully added`.yellow);
                    console.log("------------")
                    start();
                });
            });
        });
    });
};