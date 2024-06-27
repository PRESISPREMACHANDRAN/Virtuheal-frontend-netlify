import {SearchBar} from "./SearchBar.jsx";
import {useState} from "react";
import {SearchResultsList} from "./SearchResultsList.jsx";
import "./SearchResultsList.css";

function SearchUser() {
    const [results, setResults] = useState([]);

    return (
        <div className="SearchBarContainer">
            <SearchBar setResults={setResults}/>
            <SearchResultsList results={results}/>
        </div>
    );
}

export default SearchUser;

