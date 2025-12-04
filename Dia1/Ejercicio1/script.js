const API_URL = 'https://rickandmortyapi.com/api';

async function searchCharacter() {
  let allCharacters = [];
  let page = 1;
  let hasMorePages = true;


  while (hasMorePages) {
    const response = await fetch(
      `https://rickandmortyapi.com/api/character?name=${searchTerm}&page=${page}`
    );
    

    allCharacters = allCharacters.concat(data.results);
    

    if (data.info.next) {
      page++;
    } else {
      hasMorePages = false;
    }
  }
}