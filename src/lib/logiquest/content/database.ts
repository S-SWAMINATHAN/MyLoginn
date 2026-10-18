/** Database. SQL output questions run against an in-memory SQLite database during `npm run lq:validate`. */
import type { RawQ, RawSubject } from "../types";
import { m, m2, m3, topic } from "./build";

const SETUP = `CREATE TABLE emp (id INTEGER PRIMARY KEY, name TEXT, dept TEXT, salary INTEGER, manager_id INTEGER);
INSERT INTO emp VALUES (1,'Asha','IT',70000,NULL),(2,'Ravi','IT',50000,1),(3,'Meena','HR',45000,1),(4,'John','Sales',40000,3),(5,'Sara','Sales',55000,3),(6,'Imran','IT',60000,2),(7,'Lata','HR',NULL,3);
CREATE TABLE dept (code TEXT PRIMARY KEY, title TEXT, city TEXT);
INSERT INTO dept VALUES ('IT','Technology','Chennai'),('HR','People','Pune'),('Sales','Revenue','Mumbai'),('Ops','Operations','Delhi');`;
const TABLES = `\`\`\`
emp
id | name  | dept  | salary | manager_id
1  | Asha  | IT    | 70000  | NULL
2  | Ravi  | IT    | 50000  | 1
3  | Meena | HR    | 45000  | 1
4  | John  | Sales | 40000  | 3
5  | Sara  | Sales | 55000  | 3
6  | Imran | IT    | 60000  | 2
7  | Lata  | HR    | NULL   | 3

dept
code  | title      | city
IT    | Technology | Chennai
HR    | People     | Pune
Sales | Revenue    | Mumbai
Ops   | Operations | Delhi
\`\`\``;
/** Prints a single value, or one line per row with columns joined by ", ". */
export const sql = (query: string, o: string[], e: string, d: 1 | 2 | 3 = 2): RawQ => {
  const py = `import sqlite3\nc = sqlite3.connect(':memory:')\nc.executescript(${JSON.stringify(SETUP)})\nrows = c.execute(${JSON.stringify(query)}).fetchall()\nprint(rows[0][0] if len(rows) == 1 and len(rows[0]) == 1 else '\\n'.join(', '.join(str(v) for v in r) for r in rows))`;
  return m(`Using the tables below, what is the result of this query?\n${TABLES}\n\`\`\`sql\n${query}\n\`\`\``, o, e, { d, check: `py:${py}` });
};

const basics: RawQ[] = [
  m("What does DBMS stand for?", ["Database Management System", "Data Backup Management System", "Distributed Basic Memory System", "Database Modelling Software"], "A DBMS is software that stores, retrieves and manages data."),
  m("Which of these is NOT an advantage of a DBMS over a file system?", ["Lower initial cost and simplicity", "Reduced data redundancy", "Concurrent access control", "Data integrity and security"], "A DBMS adds cost and complexity in exchange for integrity, security, concurrency and reduced redundancy."),
  m("Data about data is called:", ["Metadata", "Raw data", "Big data", "Redundant data"], "Metadata (stored in the data dictionary) describes the structure of the data."),
  m("The overall design of a database is called its:", ["Schema", "Instance", "Tuple", "Domain"], "The schema is the structure; an instance is the data at a particular moment."),
  m("Which level of abstraction describes how data is physically stored?", ["Physical (internal) level", "Logical (conceptual) level", "View (external) level", "Application level"], "The three-schema architecture has physical, logical and view levels."),
  m("Physical data independence means:", ["The physical storage can change without changing the logical schema", "Data cannot be physically deleted", "Users can see physical files", "Tables are independent of each other"], "Applications are unaffected by changes in storage structures."),
  m("Which language is used to define the database structure (CREATE, ALTER, DROP)?", ["DDL", "DML", "DCL", "TCL"], "Data Definition Language defines schemas; DML manipulates data."),
  m("GRANT and REVOKE belong to:", ["DCL", "DDL", "DML", "TCL"], "Data Control Language manages permissions."),
  m("Who is responsible for the overall control of the database system?", ["Database Administrator (DBA)", "End user", "Application programmer", "System analyst"], "The DBA manages schema, security, backup and performance."),
];

const models: RawQ[] = [
  m("In an E-R diagram, an entity set is represented by a:", ["Rectangle", "Ellipse", "Diamond", "Line"], "Rectangles are entity sets, ellipses attributes, diamonds relationships."),
  m("A relationship set in an E-R diagram is represented by a:", ["Diamond", "Rectangle", "Ellipse", "Double ellipse"], "Diamonds denote relationships."),
  m("An attribute that can have several values for one entity (e.g. phone numbers) is called:", ["Multivalued attribute", "Derived attribute", "Composite attribute", "Key attribute"], "Multivalued attributes are drawn with a double ellipse."),
  m("An attribute whose value is computed from other attributes (e.g. age from date of birth) is:", ["Derived", "Composite", "Multivalued", "Simple"], "Derived attributes are shown with a dashed ellipse."),
  m("A weak entity set is one that:", ["Does not have a primary key of its own and depends on an owner entity", "Has no attributes", "Has only one row", "Cannot participate in relationships"], "Weak entities are identified using their owner's key plus a partial key."),
  m("If each employee works in exactly one department and a department has many employees, the relationship is:", ["Many-to-one (employee to department)", "One-to-one", "Many-to-many", "One-to-many (employee to department)"], "Many employees map to one department."),
  m("Which data model represents data as tables of rows and columns?", ["Relational model", "Hierarchical model", "Network model", "Object model"], "The relational model, proposed by E. F. Codd, uses relations (tables)."),
  m2("A many-to-many relationship between Students and Courses is implemented in a relational database by:", ["A separate table holding foreign keys to both", "A foreign key in Students only", "A foreign key in Courses only", "Merging the two tables"], "A junction (associative) table such as Enrolment(student_id, course_id) resolves many-to-many relationships."),
];

const relational: RawQ[] = [
  m("A row in a relational table is also called a:", ["Tuple", "Attribute", "Domain", "Schema"], "Rows are tuples; columns are attributes."),
  m("The number of attributes in a relation is called its:", ["Degree", "Cardinality", "Domain", "Arity of rows"], "Degree = number of columns; cardinality = number of rows."),
  m("A minimal set of attributes that uniquely identifies each tuple is a:", ["Candidate key", "Super key", "Foreign key", "Composite attribute"], "A candidate key is a minimal super key; one candidate key is chosen as the primary key."),
  m("A super key is:", ["Any set of attributes that uniquely identifies tuples", "A key with exactly one attribute", "A foreign key in another table", "The largest attribute"], "Every candidate key is a super key, but super keys need not be minimal."),
  m("A foreign key:", ["Refers to the primary key of another (or the same) table", "Must be unique", "Cannot be NULL ever", "Is always the first column"], "Foreign keys enforce referential integrity."),
  m("Entity integrity requires that:", ["The primary key cannot be NULL", "Foreign keys cannot be NULL", "All columns are unique", "Tables have no duplicates in any column"], "Each tuple must be identifiable by a non-null primary key."),
  m("Which relational algebra operation selects rows that satisfy a condition?", ["Selection (σ)", "Projection (π)", "Union (∪)", "Cartesian product (×)"], "Selection filters rows; projection picks columns."),
  m2("If relation R has 4 tuples and S has 3 tuples, how many tuples are in R × S?", ["12", "7", "4", "3"], "The Cartesian product pairs every tuple of R with every tuple of S: 4 × 3 = 12.", { check: "4*3" }),
  m2("Which relational algebra operation removes duplicate columns and keeps only specified attributes?", ["Projection (π)", "Selection (σ)", "Join (⋈)", "Division (÷)"], "Projection returns the chosen attributes (and removes duplicate rows in pure relational algebra)."),
];

const sqlBasics: RawQ[] = [
  sql("SELECT COUNT(*) FROM emp;", ["7", "6", "4", "11"], "COUNT(*) counts all rows, including the one with a NULL salary.", 1),
  sql("SELECT COUNT(salary) FROM emp;", ["6", "7", "5", "0"], "COUNT(column) ignores NULL values; Lata's salary is NULL.", 2),
  sql("SELECT name FROM emp WHERE salary > 55000 ORDER BY salary DESC;", ["Asha\nImran", "Imran\nAsha", "Asha\nImran\nSara", "Sara\nAsha"], "Salaries above 55000 are 70000 (Asha) and 60000 (Imran), sorted descending.", 1),
  sql("SELECT name FROM emp WHERE dept = 'HR' AND salary IS NULL;", ["Lata", "Meena", "Meena\nLata", "No rows"], "Only Lata is in HR with a NULL salary. Use IS NULL, not = NULL.", 2),
  sql("SELECT name FROM emp WHERE name LIKE '_a%' ORDER BY name;", ["Lata\nRavi\nSara", "Asha\nLata\nRavi\nSara", "Ravi\nSara", "Lata\nSara"], "'_a%' matches names whose second letter is 'a': Lata, Ravi, Sara.", 3),
  sql("SELECT MAX(salary) - MIN(salary) FROM emp;", ["30000", "70000", "25000", "NULL"], "Aggregates ignore NULL: 70000 − 40000 = 30000.", 2),
  sql("SELECT DISTINCT dept FROM emp ORDER BY dept;", ["HR\nIT\nSales", "IT\nHR\nSales", "HR\nIT\nOps\nSales", "IT\nIT\nHR\nSales"], "DISTINCT removes duplicates; Ops has no employees.", 1),
  sql("SELECT name FROM emp WHERE salary BETWEEN 45000 AND 55000 ORDER BY id;", ["Ravi\nMeena\nSara", "Ravi\nSara", "Meena\nSara", "Ravi\nMeena\nJohn\nSara"], "BETWEEN is inclusive: 50000, 45000 and 55000 qualify.", 2),
  m("Which SQL clause filters rows before grouping?", ["WHERE", "HAVING", "ORDER BY", "GROUP BY"], "WHERE filters rows; HAVING filters groups after aggregation."),
  m("Which statement removes all rows from a table but keeps its structure, usually faster than DELETE?", ["TRUNCATE TABLE", "DROP TABLE", "DELETE TABLE", "REMOVE TABLE"], "TRUNCATE deallocates data quickly; DROP removes the table itself."),
];

const advancedSql: RawQ[] = [
  sql("SELECT dept, COUNT(*) FROM emp GROUP BY dept ORDER BY dept;", ["HR, 2\nIT, 3\nSales, 2", "HR, 1\nIT, 3\nSales, 2", "IT, 3\nHR, 2\nSales, 2", "HR, 2\nIT, 3\nOps, 0\nSales, 2"], "GROUP BY produces one row per department present in emp.", 2),
  sql("SELECT dept FROM emp GROUP BY dept HAVING AVG(salary) > 50000 ORDER BY dept;", ["IT", "IT\nSales", "HR\nIT", "Sales"], "Average salaries: IT 60000, Sales 47500, HR 45000 (NULL ignored). Only IT exceeds 50000.", 3),
  sql("SELECT name FROM emp WHERE salary > (SELECT AVG(salary) FROM emp) ORDER BY name;", ["Asha\nImran\nSara", "Asha\nImran", "Asha\nImran\nRavi\nSara", "Sara"], "The average of the six non-NULL salaries is 53333.33; Asha, Imran and Sara earn more.", 3),
  sql("SELECT COUNT(*) FROM emp WHERE manager_id IN (SELECT id FROM emp WHERE dept = 'HR');", ["3", "2", "1", "0"], "HR employees are Meena (3) and Lata (7). John, Sara and Lata report to Meena.", 3),
  sql("SELECT SUM(salary) FROM emp WHERE dept = 'Sales';", ["95000", "40000", "55000", "47500"], "40000 + 55000 = 95000.", 1),
  sql("SELECT name FROM emp ORDER BY salary DESC LIMIT 1 OFFSET 1;", ["Imran", "Asha", "Sara", "Ravi"], "Sorted by salary descending: Asha, Imran, … Skipping one row gives Imran. (In SQLite, NULL sorts last in DESC order.)", 2),
  m("Which keyword combines the results of two SELECT statements and removes duplicates?", ["UNION", "UNION ALL", "JOIN", "INTERSECT ALL"], "UNION removes duplicates; UNION ALL keeps them."),
  m("A view in SQL is:", ["A stored query that behaves like a virtual table", "A physical copy of a table", "An index", "A trigger"], "Views simplify queries and restrict access to data."),
  m("What is a correlated subquery?", ["A subquery that refers to columns of the outer query and runs once per outer row", "A subquery in the FROM clause", "A subquery that returns one value", "A subquery joined with UNION"], "Correlated subqueries depend on the current row of the outer query."),
  m("Which window function assigns 1, 2, 3, … to rows without gaps or ties?", ["ROW_NUMBER()", "RANK()", "DENSE_RANK()", "NTILE()"], "RANK leaves gaps after ties; DENSE_RANK does not; ROW_NUMBER is always unique."),
];

const joins: RawQ[] = [
  sql("SELECT e.name, d.city FROM emp e JOIN dept d ON e.dept = d.code WHERE e.id = 5;", ["Sara, Mumbai", "Sara, Chennai", "Sara, Sales", "No rows"], "An inner join matches Sara's dept Sales to Mumbai.", 1),
  sql("SELECT COUNT(*) FROM dept d LEFT JOIN emp e ON e.dept = d.code;", ["8", "7", "4", "28"], "Seven employees match their departments, and Ops (no employees) still appears once with NULLs: 7 + 1 = 8.", 3),
  sql("SELECT d.title FROM dept d LEFT JOIN emp e ON e.dept = d.code WHERE e.id IS NULL;", ["Operations", "Technology", "People", "No rows"], "A left join with 'IS NULL' finds departments that have no employees.", 2),
  sql("SELECT e.name, m.name FROM emp e JOIN emp m ON e.manager_id = m.id WHERE e.id = 6;", ["Imran, Ravi", "Imran, Asha", "Ravi, Imran", "Imran, Meena"], "A self join matches Imran's manager_id (2) to Ravi.", 2),
  sql("SELECT COUNT(*) FROM emp CROSS JOIN dept;", ["28", "11", "7", "4"], "A cross join pairs every employee with every department: 7 × 4 = 28.", 2),
  m("Which join returns all rows from both tables, matching where possible?", ["FULL OUTER JOIN", "INNER JOIN", "LEFT JOIN", "CROSS JOIN"], "A full outer join keeps unmatched rows from both sides."),
  m("An INNER JOIN returns:", ["Only rows with matching values in both tables", "All rows from the left table", "All rows from both tables", "The Cartesian product"], "Unmatched rows are excluded."),
  m("A natural join joins tables on:", ["All columns with the same name", "The primary key only", "Any condition you specify", "No condition"], "NATURAL JOIN matches equally named columns automatically."),
];

const normalization: RawQ[] = [
  m("A relation is in 1NF if:", ["All attribute values are atomic (no repeating groups)", "It has no partial dependencies", "It has no transitive dependencies", "Every determinant is a candidate key"], "First normal form requires atomic values."),
  m("2NF removes:", ["Partial dependencies of non-key attributes on part of a composite key", "Transitive dependencies", "Multivalued dependencies", "Repeating groups only"], "In 2NF every non-key attribute depends on the whole key."),
  m("3NF removes:", ["Transitive dependencies of non-key attributes on the key", "Partial dependencies only", "Repeating groups", "All functional dependencies"], "In 3NF non-key attributes depend only on the key, not on other non-key attributes."),
  m("A relation is in BCNF if:", ["Every determinant of a non-trivial functional dependency is a super key", "It is in 1NF", "It has a single-column key", "It has no NULLs"], "BCNF is a stricter version of 3NF."),
  m2("In Student(roll_no, course_id, student_name, course_name) with key (roll_no, course_id), student_name depends only on roll_no. This violates:", ["2NF", "1NF", "BCNF only", "No normal form"], "student_name depends on part of the composite key — a partial dependency."),
  m2("In Emp(emp_id, dept_id, dept_name) with key emp_id, dept_name depends on dept_id. This is a:", ["Transitive dependency (violates 3NF)", "Partial dependency", "Multivalued dependency", "Trivial dependency"], "emp_id → dept_id → dept_name."),
  m("The main purpose of normalization is to:", ["Reduce redundancy and avoid update anomalies", "Increase data duplication", "Speed up all queries", "Remove primary keys"], "Normalization prevents insertion, update and deletion anomalies."),
  m("4NF deals with:", ["Multivalued dependencies", "Partial dependencies", "Transitive dependencies", "Join dependencies only"], "Fourth normal form removes non-trivial multivalued dependencies."),
  m3("If A → B and B → C hold, which dependency follows by Armstrong's axioms?", ["A → C", "C → A", "B → A", "C → B"], "Transitivity: A → B and B → C give A → C."),
];

const transactions: RawQ[] = [
  m("What does ACID stand for?", ["Atomicity, Consistency, Isolation, Durability", "Accuracy, Concurrency, Integrity, Data", "Atomicity, Concurrency, Integrity, Durability", "Access, Control, Isolation, Data"], "These are the properties of reliable transactions."),
  m("Which ACID property ensures a transaction is all-or-nothing?", ["Atomicity", "Consistency", "Isolation", "Durability"], "Either all operations take effect or none do."),
  m("Which property ensures committed changes survive a crash?", ["Durability", "Atomicity", "Isolation", "Consistency"], "Durability is typically provided by write-ahead logging."),
  m("A 'dirty read' occurs when a transaction:", ["Reads data written by another uncommitted transaction", "Reads the same row twice", "Deletes data", "Reads from a backup"], "If the other transaction rolls back, the read value never really existed."),
  m("Which isolation level prevents dirty reads, non-repeatable reads and phantom reads?", ["Serializable", "Read uncommitted", "Read committed", "Repeatable read"], "Serializable is the strictest standard isolation level."),
  m("What is a deadlock in a database?", ["Two or more transactions each waiting for locks held by the others", "A table with no primary key", "A failed backup", "A slow query"], "The DBMS detects deadlocks and aborts one transaction."),
  m("Which command makes a transaction's changes permanent?", ["COMMIT", "ROLLBACK", "SAVEPOINT", "BEGIN"], "ROLLBACK undoes changes; SAVEPOINT marks a point to roll back to."),
  m2("Two-phase locking (2PL) guarantees:", ["Conflict-serializable schedules", "No deadlocks", "No locking at all", "Faster commits"], "2PL (growing then shrinking phase) ensures serializability but can still deadlock."),
];

const indexing: RawQ[] = [
  m("What is the main purpose of an index?", ["To speed up data retrieval", "To store backups", "To enforce foreign keys only", "To compress tables"], "Indexes let the DBMS find rows without scanning the whole table."),
  m("Which data structure is most commonly used for database indexes?", ["B+ tree", "Linked list", "Stack", "Queue"], "B+ trees keep data sorted and balanced with logarithmic access."),
  m("A clustered index:", ["Determines the physical order of rows in the table", "Is stored separately from the table with pointers", "Can exist many times per table", "Is used only for text"], "A table can have only one clustered index."),
  m("What is a disadvantage of having many indexes?", ["Slower INSERT, UPDATE and DELETE operations and more storage", "Slower SELECT queries", "Loss of data", "No primary keys"], "Every index must be maintained when data changes."),
  m("Hash indexes are best suited for:", ["Equality searches", "Range queries", "Sorting", "LIKE '%text%' searches"], "Hashing finds exact keys quickly but does not preserve order."),
  m("In a B+ tree, actual data pointers are stored in:", ["The leaf nodes", "The root only", "Internal nodes only", "No nodes"], "Leaves hold the records (or pointers) and are linked for range scans."),
  m2("Which query is LEAST likely to use a B-tree index on name?", ["WHERE name LIKE '%son'", "WHERE name = 'Asha'", "WHERE name LIKE 'As%'", "ORDER BY name"], "A leading wildcard prevents using the sorted order of the index."),
];

const nosql: RawQ[] = [
  m("Which type of NoSQL database stores data as JSON-like documents?", ["Document store (e.g. MongoDB)", "Key-value store", "Column-family store", "Graph database"], "Document databases store flexible, nested documents."),
  m("Redis is primarily a:", ["Key-value store", "Graph database", "Relational database", "Document store"], "Redis is an in-memory key-value data store."),
  m("Which NoSQL type is best for highly connected data such as social networks?", ["Graph database", "Key-value store", "Column store", "Document store"], "Graph databases (e.g. Neo4j) store nodes and relationships natively."),
  m("The CAP theorem says a distributed system cannot simultaneously guarantee:", ["Consistency, Availability and Partition tolerance", "Concurrency, Atomicity and Performance", "Caching, Availability and Persistence", "Consistency, Atomicity and Partitioning"], "During a network partition, a system must choose between consistency and availability."),
  m("BASE in NoSQL systems stands for:", ["Basically Available, Soft state, Eventually consistent", "Binary, Atomic, Secure, Efficient", "Balanced, Available, Scalable, Elastic", "Basic Access, Simple Encryption"], "BASE trades immediate consistency for availability."),
  m("Cassandra is an example of a:", ["Wide-column store", "Graph database", "Relational database", "Document store"], "Cassandra stores data in column families across a distributed cluster."),
  m("Which is a typical reason to choose a NoSQL database?", ["Horizontal scaling with flexible schemas", "Complex multi-table joins", "Strict ACID transactions across many tables", "Small fixed datasets"], "NoSQL systems favour scale-out and schema flexibility."),
];

const subject: RawSubject = {
  "database-basics": topic(basics, { intro: "A database is an organised collection of related data; a DBMS is the software that stores, retrieves and protects it.", formulas: [{ h: "Key ideas", points: ["Three-schema architecture: physical, logical (conceptual) and view (external) levels", "Data independence: physical and logical", "Languages: DDL (CREATE, ALTER, DROP), DML (SELECT, INSERT, UPDATE, DELETE), DCL (GRANT, REVOKE), TCL (COMMIT, ROLLBACK)"] }] }),
  "data-models-and-er-diagrams": topic(models, { intro: "The Entity–Relationship model describes data as entities, attributes and relationships before it is turned into tables.", formulas: [{ h: "Notation", points: ["Rectangle: entity set; double rectangle: weak entity", "Ellipse: attribute; double ellipse: multivalued; dashed: derived; underlined: key", "Diamond: relationship; cardinalities 1:1, 1:N, M:N"] }] }),
  "relational-model-and-keys": topic(relational, { intro: "The relational model stores data in relations (tables) of tuples (rows) and attributes (columns).", formulas: [{ h: "Keys", points: ["Super key ⊇ candidate key (minimal) → primary key (chosen); alternate keys are the other candidates", "Foreign key references a primary key", "Integrity: entity (PK not NULL), referential (FK must match an existing PK or be NULL)"] }] }),
  "sql-basics": topic(sqlBasics, { intro: "SQL queries read data with SELECT … FROM … WHERE … ORDER BY.", formulas: [{ h: "Points", points: ["Logical order: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT", "Compare with NULL using IS NULL / IS NOT NULL", "LIKE: % any sequence, _ one character", "COUNT(*) counts rows; COUNT(col) skips NULLs; aggregates ignore NULLs"] }] }),
  "advanced-sql": topic(advancedSql, { intro: "Grouping, HAVING, subqueries, set operations, views and window functions let SQL answer complex questions." }),
  joins: topic(joins, { intro: "Joins combine rows from two tables based on a condition.", formulas: [{ h: "Types", points: ["INNER JOIN: matching rows only", "LEFT/RIGHT OUTER JOIN: all rows from one side plus matches (NULLs otherwise)", "FULL OUTER JOIN: all rows from both", "CROSS JOIN: Cartesian product", "Self join: a table joined to itself"] }] }),
  normalization: topic(normalization, { intro: "Normalization organises tables to reduce redundancy and anomalies using functional dependencies.", formulas: [{ h: "Normal forms", points: ["1NF: atomic values", "2NF: 1NF + no partial dependency on a composite key", "3NF: 2NF + no transitive dependency", "BCNF: every determinant is a super key", "4NF: no non-trivial multivalued dependency"] }] }),
  "transactions-and-concurrency": topic(transactions, { intro: "A transaction is a logical unit of work that must satisfy the ACID properties. Concurrency control (locks, timestamps, MVCC) keeps simultaneous transactions correct." }),
  "indexing-and-hashing": topic(indexing, { intro: "Indexes (usually B+ trees, sometimes hash tables) speed up lookups at the cost of extra storage and slower writes." }),
  "nosql-databases": topic(nosql, { intro: "NoSQL databases (key-value, document, wide-column, graph) relax the relational model to scale horizontally and handle flexible or connected data." }),
};
export default subject;
