const CLIENT_ID='1086619805736-6i07q80o27m30s3i9etvm2vlii329emd.apps.googleusercontent.com';

const DISCOVERY_DOCS=['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'];

const SCOPES='https://www.googleapis.com/auth/youtube.readonly';

const dugmeZaLogIn=document.getElementById('authorize-button');
const dugmeZaLogOut=document.getElementById('signout-button');
const sadrzaj = document.getElementById('content');
const channelForm = document.getElementById('channel-form');
const channelInput = document.getElementById('channel-input');
const videoContainer = document.getElementById('video-container');

const podrazumevaniKanal = 'elabrs';

function handleClientLoad() {
    gapi.load('client:auth2', inicijalizujKlijenta);
}

function obradiLogIn(){
    gapi.auth2.getAuthInstance().signIn();
}
  
function obradiLogOut() {
    gapi.auth2.getAuthInstance().signOut();
}
  
function azurirajStatusLogovanja(isSignedIn) {
    if (isSignedIn) {
      dugmeZaLogIn.style.display = 'none';
      dugmeZaLogOut.style.display = 'block';
      sadrzaj.style.display = 'block';
      videoContainer.style.display = 'block';
      
      uzmiPodatkeOKanalu(podrazumevaniKanal);
    } else {
      dugmeZaLogIn.style.display = 'block';
      dugmeZaLogOut.style.display = 'none';
      sadrzaj.style.display = 'none';
      videoContainer.style.display = 'none';
    }
  }
  


function inicijalizujKlijenta() {
    gapi.client.init({
        discoveryDocs: DISCOVERY_DOCS,
        clientId: CLIENT_ID,
        scope: SCOPES
        }).then(() => {

        gapi.auth2.getAuthInstance().isSignedIn.listen(azurirajStatusLogovanja);
        azurirajStatusLogovanja(gapi.auth2.getAuthInstance().isSignedIn.get());
        
        dugmeZaLogIn.onclick = obradiLogIn;
        dugmeZaLogOut.onclick = obradiLogOut;
        });
}

//zavrsena autentifikacija

function uzmiPodatkeOKanalu(zadatiKanal) {
    gapi.client.youtube.channels
      .list({
        part: 'snippet,contentDetails,statistics',
        forUsername: zadatiKanal
      })
      .then(response => {
        console.log(response);
        const channel = response.result.items[0];
  
        const output = `
          <ul class="collection">
            <li class="collection-item">Title: ${channel.snippet.title}</li>
            <li class="collection-item">ID: ${channel.id}</li>
            <li class="collection-item">Subscribers: ${
              channel.statistics.subscriberCount
            }</li>
            <li class="collection-item">Views: ${
              channel.statistics.viewCount
            }</li>
            <li class="collection-item">Comments: ${
                channel.statistics.commentCount
              }</li>
            <li class="collection-item">Videos: ${
              channel.statistics.videoCount
            }</li>
          </ul>
          <p>${channel.snippet.description}</p>
          <hr>
          <img src="${channel.snippet.thumbnails.default.url}" alt="Logo kanala">
        `;
        prikaziPodatkeOKanalu(output);
  
        const playlistId = channel.contentDetails.relatedPlaylists.uploads;
        zahtevajVideoKlipove(playlistId);
      })
      .catch(err => alert('Nije pronađen kanal sa tim imenom'));
}

function prikaziPodatkeOKanalu(podaci) {
    const podaciOKanalu = document.getElementById('channel-data');
    podaciOKanalu.innerHTML = podaci;
}
  

channelForm.addEventListener('submit', e => {
    e.preventDefault();
  
    const kanal = channelInput.value;
  
    uzmiPodatkeOKanalu(kanal);
});


function zahtevajVideoKlipove(playlistId) {
    const parametriZahteva = {
      playlistId: playlistId,
      part: 'snippet',
      maxResults: 10
    }
  
    const zahtev = gapi.client.youtube.playlistItems.list(parametriZahteva);
  
    zahtev.execute(response => {
      console.log(response);
  
      const stavkePlejListe = response.result.items;
      if (stavkePlejListe) {
          let output = '<h4 class="center-align"> Najnoviji videi </h4>';
  
          stavkePlejListe.forEach(item => {
            const videoId = item.snippet.resourceId.videoId;
            output += `
              <div class="col s3">
                <iframe width="100%" height="auto" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
              </div>
            `;
          });
  
          videoContainer.innerHTML = output;
      } else{
        videoContainer.innerHTML = "Ovaj kanal nema video klipove."
      }
    });
  }
  
    
  
  
