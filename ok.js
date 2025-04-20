import axios from 'axios';

const options = {
  method: 'GET',
  url: 'https://deezerdevs-deezer.p.rapidapi.com/playlist/2228601362',
  headers: {
    'x-rapidapi-key': '67685ec1f0msh5feaa6bf64dbeadp16ffa5jsnd72b2a894302',
    'x-rapidapi-host': 'deezerdevs-deezer.p.rapidapi.com'
  }
};

async function fetchData() {
	try {
		const response = await axios.request(options);
		console.log(response.data);
	} catch (error) {
		console.error(error);
	}
}

fetchData();