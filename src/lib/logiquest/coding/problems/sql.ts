/** SQL problems, judged on the server against an in-memory SQLite database. */
import type { SqlProblemDef } from "../types";

const COMPANY = `CREATE TABLE departments (id INTEGER PRIMARY KEY, name TEXT NOT NULL, city TEXT);
CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT, salary INTEGER, dept_id INTEGER REFERENCES departments(id), manager_id INTEGER, hired TEXT);
INSERT INTO departments VALUES (1,'Engineering','Chennai'),(2,'Sales','Mumbai'),(3,'HR','Pune'),(4,'Research','Bengaluru');
INSERT INTO employees VALUES
 (1,'Asha','asha@corp.in',120000,1,NULL,'2019-04-01'),
 (2,'Ravi','ravi@corp.in',90000,1,1,'2020-06-15'),
 (3,'Meena','meena@corp.in',85000,2,1,'2018-01-10'),
 (4,'John','john@corp.in',60000,2,3,'2021-09-01'),
 (5,'Sara','sara@corp.in',95000,1,1,'2022-02-20'),
 (6,'Imran','imran@corp.in',70000,3,1,'2020-11-05'),
 (7,'Lata','lata@corp.in',55000,2,3,'2023-03-12'),
 (8,'Kiran','asha@corp.in',90000,1,2,'2021-07-30');`;

const SHOP = `CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT NOT NULL, city TEXT);
CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER REFERENCES customers(id), amount INTEGER, order_date TEXT);
INSERT INTO customers VALUES (1,'Anil','Delhi'),(2,'Bina','Chennai'),(3,'Chetan','Delhi'),(4,'Divya','Kolkata'),(5,'Esha','Chennai');
INSERT INTO orders VALUES (1,1,500,'2024-01-05'),(2,1,700,'2024-02-10'),(3,2,200,'2024-01-20'),(4,3,1500,'2024-03-01'),(5,2,800,'2024-03-15'),(6,1,300,'2024-03-20'),(7,5,1000,'2024-02-01');`;

const S = (p: Omit<SqlProblemDef, "kind" | "tracks"> & { tracks?: string[] }): SqlProblemDef => ({ kind: "sql", tracks: ["sql"], ...p });

export const sqlProblems: SqlProblemDef[] = [
  S({ slug: "sql-high-earners", title: "High Earners", difficulty: "Easy", tags: ["SELECT", "WHERE", "ORDER BY"], schema: COMPANY, ordered: true,
    statement: "Return the **name** and **salary** of employees who earn more than 80000, highest salary first. Break ties by name.",
    ref: "SELECT name, salary FROM employees WHERE salary > 80000 ORDER BY salary DESC, name;",
    hints: ["Filter rows with WHERE.", "Sort with ORDER BY salary DESC, then name."], editorial: "A simple filter plus a two-key sort: `WHERE salary > 80000 ORDER BY salary DESC, name`." }),
  S({ slug: "sql-employees-per-department", title: "Employees per Department", difficulty: "Easy", tags: ["GROUP BY", "COUNT"], schema: COMPANY, ordered: false,
    statement: "Return each department id (**dept_id**) and the number of employees in it (**total**).",
    ref: "SELECT dept_id, COUNT(*) AS total FROM employees GROUP BY dept_id;",
    hints: ["Group rows by dept_id.", "COUNT(*) counts the rows in each group."], editorial: "`GROUP BY dept_id` with `COUNT(*)`." }),
  S({ slug: "sql-second-highest-salary", title: "Second Highest Salary", difficulty: "Medium", tags: ["Subquery", "MAX"], schema: COMPANY, ordered: true,
    statement: "Return the second highest **distinct** salary as a single column named **second_highest**.",
    ref: "SELECT MAX(salary) AS second_highest FROM employees WHERE salary < (SELECT MAX(salary) FROM employees);",
    hints: ["The second highest is the maximum of salaries below the maximum.", "Alternatively use DISTINCT with ORDER BY … LIMIT 1 OFFSET 1."], editorial: "Take MAX(salary) among salaries strictly below the overall MAX. This also handles duplicates of the top salary." }),
  S({ slug: "sql-employee-department-names", title: "Employee with Department", difficulty: "Easy", tags: ["JOIN"], schema: COMPANY, ordered: true,
    statement: "Return each employee's **name** and their department's name as **department**, ordered by employee name.",
    ref: "SELECT e.name, d.name AS department FROM employees e JOIN departments d ON d.id = e.dept_id ORDER BY e.name;",
    hints: ["Join employees to departments on dept_id = departments.id.", "Alias the department name column."], editorial: "An inner join on the foreign key, ordered by employee name." }),
  S({ slug: "sql-customers-without-orders", title: "Customers Who Never Ordered", difficulty: "Easy", tags: ["LEFT JOIN", "NULL"], schema: SHOP, ordered: false,
    statement: "Return the **name** of every customer who has never placed an order.",
    ref: "SELECT c.name FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.id IS NULL;",
    hints: ["A LEFT JOIN keeps customers without matching orders.", "Unmatched rows have NULL order columns.", "NOT IN or NOT EXISTS also work."], editorial: "LEFT JOIN customers to orders and keep the rows where the order side is NULL." }),
  S({ slug: "sql-total-spent", title: "Total Spent per Customer", difficulty: "Medium", tags: ["JOIN", "GROUP BY", "SUM"], schema: SHOP, ordered: true,
    statement: "Return each customer's **name** and the total amount of their orders as **total_spent**, only for customers who ordered, highest total first.",
    ref: "SELECT c.name, SUM(o.amount) AS total_spent FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.id, c.name ORDER BY total_spent DESC;",
    hints: ["Join customers with orders.", "Group by customer and SUM the amounts.", "Order by the aggregate."], editorial: "Inner join (so only customers with orders appear), group by customer and order by SUM(amount) descending." }),
  S({ slug: "sql-duplicate-emails", title: "Duplicate Emails", difficulty: "Easy", tags: ["GROUP BY", "HAVING"], schema: COMPANY, ordered: false,
    statement: "Return every **email** that appears more than once in the employees table.",
    ref: "SELECT email FROM employees GROUP BY email HAVING COUNT(*) > 1;",
    hints: ["Group by email.", "Filter groups with HAVING COUNT(*) > 1."], editorial: "HAVING filters after grouping, which is where COUNT(*) is available." }),
  S({ slug: "sql-above-department-average", title: "Above Department Average", difficulty: "Medium", tags: ["Correlated Subquery"], schema: COMPANY, ordered: true,
    statement: "Return the **name** and **salary** of employees who earn more than the average salary of their own department, ordered by name.",
    ref: "SELECT e.name, e.salary FROM employees e WHERE e.salary > (SELECT AVG(x.salary) FROM employees x WHERE x.dept_id = e.dept_id) ORDER BY e.name;",
    hints: ["Compare each employee with an average computed for their department.", "A correlated subquery references the outer row's dept_id.", "A window function AVG(salary) OVER (PARTITION BY dept_id) works too."], editorial: "For each employee, a correlated subquery computes the department average; keep rows above it." }),
  S({ slug: "sql-top-earner-per-department", title: "Top Earner per Department", difficulty: "Hard", tags: ["Window Functions", "RANK"], schema: COMPANY, ordered: true,
    statement: "For each department, return the department name as **department**, and the **name** and **salary** of its highest-paid employee(s). Order by department name.",
    ref: "SELECT d.name AS department, e.name, e.salary FROM (SELECT *, RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS r FROM employees) e JOIN departments d ON d.id = e.dept_id WHERE e.r = 1 ORDER BY d.name, e.name;",
    hints: ["Rank salaries within each department with RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC).", "Keep rank 1 (ties keep all top earners).", "Join to departments for the name; order by department then employee name."], editorial: "A window function ranks employees per department; filtering rank 1 returns every top earner (including ties)." }),
  S({ slug: "sql-running-total", title: "Running Total of Orders", difficulty: "Hard", tags: ["Window Functions", "SUM OVER"], schema: SHOP, ordered: true,
    statement: "Return every order's **id**, **order_date**, **amount** and the running total of amounts in date order as **running_total**. Order by order_date.",
    ref: "SELECT id, order_date, amount, SUM(amount) OVER (ORDER BY order_date) AS running_total FROM orders ORDER BY order_date;",
    hints: ["SUM(amount) OVER (ORDER BY order_date) accumulates in date order."], editorial: "A window SUM with ORDER BY produces a cumulative total row by row." }),
  S({ slug: "sql-managers-with-reports", title: "Managers with Two or More Reports", difficulty: "Medium", tags: ["Self Join", "GROUP BY"], schema: COMPANY, ordered: true,
    statement: "Return the **name** of each employee who directly manages at least two other employees, along with the number as **reports**, ordered by name.",
    ref: "SELECT m.name, COUNT(*) AS reports FROM employees e JOIN employees m ON e.manager_id = m.id GROUP BY m.id, m.name HAVING COUNT(*) >= 2 ORDER BY m.name;",
    hints: ["Join employees to itself: the employee row and the manager row.", "Group by manager and filter with HAVING."], editorial: "A self join links each employee to their manager; grouping by manager counts direct reports." }),
  S({ slug: "sql-empty-departments", title: "Departments with No Employees", difficulty: "Easy", tags: ["NOT EXISTS", "LEFT JOIN"], schema: COMPANY, ordered: false,
    statement: "Return the **name** of every department that has no employees.",
    ref: "SELECT d.name FROM departments d WHERE NOT EXISTS (SELECT 1 FROM employees e WHERE e.dept_id = d.id);",
    hints: ["Find departments for which no employee row exists.", "Use NOT EXISTS or a LEFT JOIN with IS NULL."], editorial: "NOT EXISTS with a correlated subquery returns departments that no employee references." }),
];
