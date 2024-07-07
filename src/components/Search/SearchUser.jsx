import {SearchBar} from "./SearchBar.jsx";
import {useState} from "react";
import {SearchResultsList} from "./SearchResultsList.jsx";
import "./SearchResultsList.css";
import {Container} from "react-bootstrap";

function SearchUser() {
    const [results, setResults] = useState([]);

    return (
        <Container fluid className="SearchBarContainer m-3 p-5 border rounded-4">
            <SearchBar setResults={setResults}/>
            <SearchResultsList results={results}/>
        </Container>
    );
}

export default SearchUser;

