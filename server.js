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