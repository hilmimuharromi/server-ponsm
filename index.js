const fs= require('fs')
const readline = require('readline')
const {google} = require('googleapis')

const KEYFILEPATH = './ponpes-sm-45b618bd935c.json';

// Request full drive access.
const SCOPES = ['https://www.googleapis.com/auth/drive', 'profile'];



const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: SCOPES
});

const driveService = google.drive({version: 'v3', auth});


let fileMetadata = {
    'name': 'icon.jpg',
    'parents':  [  '1zcaEOwaYn92YJ7LzzCORwcHs2dICfz6N'  ]
};

const requestBody = {
    name: 'ijazah-santria',
    mimeType: 'application/pdf',
    'parents':  [  '18UDX15ta0k2XRwJ52rELsU0zj7wycb65'  ]
  }

let media = {
    mimeType: 'image/jpeg',
    body: fs.createReadStream('tes.jpeg')
};


const tester = async () => {
    try {

        let response = await driveService.files.create({
            requestBody: requestBody,
           
            media: media,
            fields: 'id'
        });
        console.log('mediaaa =>', media)
        
        switch(response.status){
            case 200:
                let file = response.result;
                const url = `https://drive.google.com/file/d/${response.data.id}`
                console.log('Created File Id: ', url);
                break;
            default:
                console.error('Error creating the file, ' + response.errors);
                break;
        }
    } catch(err) {
        console.log('errorrrrr=>', err)
    }
    

}

function listFiles() {
    const drive = google.drive({version: 'v3', auth});
    drive.files.list({
      pageSize: 10,
      fields: 'nextPageToken, files(id, name)',
    }, (err, res) => {
      if (err) return console.log('The API returned an error: ' + err);
      const files = res.data.files;
      if (files.length) {
        console.log('Files:');
        files.map((file) => {
          console.log(`${file.name} (${file.id})`);
        });
      } else {
        console.log('No files found.');
      }
    });
  }

  listFiles()

tester()
