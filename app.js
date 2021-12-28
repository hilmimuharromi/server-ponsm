const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const app = express();
const { google } = require('googleapis');
const KEYFILEPATH = './ponpes-sm-45b618bd935c.json';
const fs = require('fs');
// Request full drive access.
const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'profile',
  'https://www.googleapis.com/auth/spreadsheets',
];
const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});
;

const driveService = google.drive({ version: 'v3', auth });
const sheetService = google.sheets({ version: 'v4', auth });
const sheetId = '1te-KcUqdYIqlcaWliiNKVQDIp4mJ3wgxS2Jhu5g_pF8';

app.use(cors());
app.use(
  fileUpload({
    // useTempFiles : true,
    // tempFileDir : '/tmp/'
  })
);

app.use(express.json());

app.get('/all', async (req, res) => {
  console.log('req ===>', req.headers);
  const request = {
    spreadsheetId: sheetId,
    // range: "Sheet1",
    resource: {
      dataFilters: [
        {
          a1Range: 'rulli',
        },
      ],
    },
  };

  try {
    const response = (await sheetService.spreadsheets.getByDataFilter(request))
      .data;
    // TODO: Change code below to process the `response` object:
    console.log(JSON.stringify(response, null, 2));
    res.status(200).json({
      response,
    });
  } catch (err) {
    console.error(err);
  }
});

app.post('/add', async (req, res) => {
  console.log('dataa =>', req.body);
  console.log('data link', req.links);

  try {
    const result = await sheetService.spreadsheets.values.append({
      auth, //auth object
      spreadsheetId: sheetId, //spreadsheet id
      range: 'Sheet1!A:B', //sheet name and range of cells
      valueInputOption: 'USER_ENTERED', // The information will be passed according to what the usere passes in as date, number or text
      resource: {
        values: [req.body.data],
      },
    });
    if (result) {
      console.log(result);
      res.status(200).json({
        data: result,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({
      error: err,
    });
  }
});

const insertData = async (req, res) => {
  console.log('masuk sini 101 ===>', req.body.data);
  try {
    const result = await sheetService.spreadsheets.values.append({
      auth, //auth object
      spreadsheetId: sheetId, //spreadsheet id
      range: 'Sheet1!A:B', //sheet name and range of cells
      valueInputOption: 'USER_ENTERED', // The information will be passed according to what the usere passes in as date, number or text
      resource: {
        values: [req.body.data],
      },
    });
    if (result) {
      console.log(result);
      res.status(200).json({
        data: result,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({
      error: err,
    });
  }
};

const uploadData = async (req, res, next) => {
  if (req.files === null) return res.status(400).send('No File Uploaded');

  const listData = ['ijazah', 'kk', 'pasFoto'];
  console.log('req body data', req.body);
  console.log('req body files', req.files);

  try {
    const dataSantri = JSON.parse(req.body.data);
    const links = [];
    const files = req.files;
    let ijazah = '';
    let kk = '';
    let pasFoto = '';
    console.log('datasantri', dataSantri)
  
    if(dataSantri.length < 20 && !dataSantri) {
      res.status(400).json({
        error: 'data tidak lengkap'
      })
    }
  
  
    listData.map(async (item) => {
      const path = `${dataSantri[0]}-${dataSantri[2]}.${files[item].name.split('.').pop()}`;
      await files[item].mv(path);
  
      await driveService.files
        .create({
          requestBody: {
            name: `${item}-${path}`,
            parents: ['18UDX15ta0k2XRwJ52rELsU0zj7wycb65'],
          },
          media: {
            mimeType: files[item].mimetype,
            body: fs.createReadStream(path),
          },
        })
        .then((response) => {
          console.log('response', 'ijazah', response.data.id);
          links.push(`https://drive.google.com/file/d/${response.data.id}`);
          switch (item) {
            case 'ijazah':
              ijazah = `https://drive.google.com/file/d/${response.data.id}`;
              break;
            case 'kk':
              kk = `https://drive.google.com/file/d/${response.data.id}`;
              break;
            case 'pasFoto':
              pasFoto = `https://drive.google.com/file/d/${response.data.id}`;
              break;
            default:
              break;
          }

  
        })
        .catch((error) => {
          console.log('error 173 ====>', error);
          res.status(400).json({
            error: JSON.stringify(error)
          })
        }).finally(() => {
          
        })
      // await fs.unlink(path);
      if (ijazah && kk && pasFoto) {
        req.body.data = dataSantri.concat([ijazah, kk, pasFoto]);
        next();
      }
    });

  } catch(err) {
    console.log('errorrrrr', err)
    res.status(400).json({
      error: 'data tidak lengkap'
    })
  }

 
};

app.post('/', uploadData, insertData);

app.get('/', (req, res) => res.send('hallo server is running'))

module.exports = app