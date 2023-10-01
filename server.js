const express = require('express');
const { body } = require('express-validator');
const { validationResult } = require('express-validator');
const app = express();

const port = 3000;
const { swaggerSpec, swaggerUi } = require('./swagger');
const mariadb = require('mariadb');
const pool = mariadb.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'sample',
  port: 3306,
  connectionLimit: 5
});
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const Sanitization = [
  body('AGENT_CODE').notEmpty().trim().escape(),
  body('AGENT_NAME').notEmpty().trim().escape()
];
const basicValidationRule = (field) => body(field).exists().not().isEmpty().trim().escape();

const Validation = [
  basicValidationRule('AGENT_CODE'),
];

//app.get('/resource', (req, res) => {
//connect to the database
//perform the request that you need (SQL)
//define the header
//});

/**
 * @swagger
 * /agents:
 *   get:
 *     summary: Retrieve a list of agents
 *     description: Retrieve a list of agents entered
 *     responses:
 *       200:
 *         description: A list of agents retrieved
 *       500:
 *         description: Internal Server Error
 */

app.get('/agents', (req, res) => {
  pool.getConnection()
    .then(conn => {
      conn.query('SELECT * FROM agents')
        .then(rows => {
          res.setHeader('Content-Type', 'application/json');
          res.status(200).json(rows);
          conn.release();
        })
        .catch(err => {
          console.error(err);
          res.status(500).send('Internal Server Error');
          conn.release();
        });
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Internal Server Error');
    });
});

/**
 * @swagger
 * /company:
 *   get:
 *     summary: Retrieve a list of companies
 *     description: a list of companies from the database.
 *     responses:
 *       200:
 *         description: list of companies retrieved
 *       500:
 *         description: Internal Server Error
 */
app.get('/company', (req, res) => {
  pool.getConnection()
    .then(conn => {
      conn.query('SELECT * FROM company')
        .then(rows => {
          res.setHeader('Content-Type', 'application/json');
          res.status(200).json(rows);
          conn.release();
        })
        .catch(err => {
          console.error(err);
          res.status(500).send('Internal Server Error');
          conn.release();
        });
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Internal Server Error');
    });
});
/**
 * @swagger
 * /customer:
 *   get:
 *     summary: a list of customer
 *     description: a list of customer from the database.
 *     responses:
 *       200:
 *         description: A list of customer retrieved
 *       500:
 *         description: Internal Server Error
 */
app.get('/customer', (req, res) => {
  pool.getConnection()
    .then(conn => {
      conn.query('SELECT * FROM customer')
        .then(rows => {
          res.setHeader('Content-Type', 'application/json');
          res.status(200).json(rows);
          conn.release();
})
.catch(err => {
  console.error(err);
  res.status(500).send('Internal Server Error');
  conn.release();
});
})
.catch(err => {
console.error(err);
res.status(500).send('Internal Server Error');
});
});

//added extra app.get to look up specific agents

/**
 * @swagger
 * /agents/{AGENT_CODE}:
 *   get:
 *     summary: Get a specific agent by code
 *     description: Get a specific agent based on their code.
 *     parameters:
 *       - in: path
 *         name: AGENT_CODE
 *         required: true
 *         description: The code of the agent to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Agent retrieved successfully
 *       404:
 *         description: Agent not found
 *       500:
 *         description: Internal Server Error
 */

app.get('/agents/:AGENT_CODE', (req, res) => {
  const agentCode = req.params.AGENT_CODE;

  pool.getConnection()
    .then(conn => {
      conn.query('SELECT * FROM agents WHERE AGENT_CODE = ?', [agentCode])
        .then(rows => {
          if (rows.length === 1) {
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json(rows[0]);
          } else {
            res.status(404).json({ message: 'Agent not found' });
          }
          conn.release();
        })
        .catch(err => {
          console.error(err);
          res.status(500).send('Internal Server Error');
          conn.release();
        });
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Internal Server Error');
    });
});


//Agents Patch code
/**
 * @swagger
 * /agents/{AGENT_CODE}:
 *   patch:
 *     summary: Update details about a specific agent based on their ID
 *     description: Update specific details of an agent based on their Agent Code.
 *     parameters:
 *       - in: path
 *         name: AGENT_CODE
 *         required: true
 *         description: The code of the agent to update.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               AGENT_NAME:
 *                 type: string
 *                 description: The newname of the agent
 *                 example: Tester Garry
 *               WORKING_AREA:
 *                 type: string
 *                 description: The new working area of the agent
 *                 example: Maryland
 *               COMMISSION:
 *                 type: number
 *                 description: The new commission rate of the agent
 *                 example: 0.15
 *               PHONE_NO:
 *                 type: string
 *                 description: The new phone number of the agent
 *                 example: 007-22382344
 *               COUNTRY:
 *                 type: string
 *                 description: The new country of the agent
 *                 example: USA
 *     responses:
 *       200:
 *         description: Agent's details updated successfully
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Agent not found
 */


app.patch('/agents/:AGENT_CODE', Validation, Sanitization, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const agentCode = req.params.AGENT_CODE;
  const updatedAgent = req.body; 
  delete updatedAgent.AGENT_CODE;

  pool.getConnection()
    .then(conn => {
      conn.query('UPDATE agents SET ? WHERE AGENT_CODE = ?', [updatedAgent, agentCode])
        .then(result => {
          if (result.affectedRows === 1) {
            res.status(200).json({ message: 'Agent details updated successfully' });
          } else {
            res.status(404).json({ message: 'Agent not found' });
          }
          conn.release();
        })
        .catch(err => {
          console.error(err);
          res.status(500).send('Internal Server Error');
          conn.release();
        });
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Internal Server Error');
    });
});


//Agents PUT code

/**
 * @swagger
 * /agents/{AGENT_CODE}:
 *   put:
 *     summary: Update agent details
 *     description: Update agent details based on the agent code through the URL
 *       - in: path
 *         name: AGENT_CODE
 *         required: true
 *         description: The code of the agent to update.
 *         schema:
 *           type: string
 *         example: A007
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               AGENT_NAME:
 *                 type: string
 *                 description: The new name of the agent.
 *                 example: Prog Dog
 *               WORKING_AREA:
 *                 type: string
 *                 description: The new working area of the agent.
 *                 example: California
 *               COMMISSION:
 *                 type: number
 *                 description: The new commission rate of the agent.
 *                 example: 0.12
 *               PHONE_NO:
 *                 type: string
 *                 description: The new phone number of the agent.
 *                 example: 007-26322344
 *               COUNTRY:
 *                 type: string
 *                 description: The new country of the agent.
 *                 example: USA
 *     responses:
 *       200:
 *         description: Agent details updated successfully
 *       404:
 *         description: Agent not found
 *       500:
 *         description: Internal Server Error
 */

app.put('/agents/:AGENT_CODE', Validation, Sanitization, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const agentCode = req.params.AGENT_CODE;
  const agentDetails = req.body;

  pool.getConnection()
    .then(conn => {
      conn.query('SELECT * FROM agents WHERE AGENT_CODE = ?', [agentCode])
        .then(rows => {
          if (rows.length === 1) {
            conn.query('UPDATE agents SET ? WHERE AGENT_CODE = ?', [agentDetails, agentCode])
              .then(result => {
                if (result.affectedRows === 1) {
                  res.status(200).json({ message: 'Agent details were updated successfully' });
                } else {
                  res.status(500).json({ message: 'Failed to update agent details' });
                }
                conn.release();
              })
              .catch(err => {
                console.error(err);
                res.status(500).send('Internal Server Error');
                conn.release();
              });
          } else {
            res.status(404).json({ message: 'Agent not found' });
            conn.release();
          }
        })
        .catch(err => {
          console.error(err);
          res.status(500).send('Internal Server Error');
          conn.release();
        });
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Internal Server Error');
    });
});


//Agents DELETE code
/**
 * @swagger
 * /agents/{AGENT_CODE}:
 *   delete:
 *     summary: Delete an agent based on the ID
 *     description: Delete agent entry based on the ID.
 *     parameters:
 *       - in: path
 *         name: AGENT_CODE
 *         required: true
 *         description: The code of the agent to delete.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Agent deleted successfully
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Agent not found
 */
app.delete('/agents/:AGENT_CODE', (req, res) => {
  const agentCode = req.params.AGENT_CODE;

  pool.getConnection()
    .then(conn => {
      conn.query('DELETE FROM agents WHERE AGENT_CODE = ?', [agentCode])
        .then(result => {
          if (result.affectedRows === 1) {
            res.status(200).json({ message: 'agent was deleted!' });
          } else {
            res.status(404).json({ message: 'did not find any agent with that code' });
          }
          conn.release();
        })
        .catch(err => {
          console.error(err);
          res.status(500).send('Internal Server Error');
          conn.release();
        });
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Internal Server Error');
    });
});
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

//listen
app.listen(port, () => {
console.log(`Example app listening at http://localhost:${port}`)
});