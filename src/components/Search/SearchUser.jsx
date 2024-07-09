import {SearchBar} from "./SearchBar.jsx";
import {useEffect, useState} from "react";
import {SearchResultsList} from "./SearchResultsList.jsx";
import "./SearchResultsList.css";
import {Alert, Container} from "react-bootstrap";
import {axiosPrivate} from "@/api/axios.js";

function SearchUser() {
    const [results, setResults] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");

    const fetchData = async () => {
        try {
            const response = await axiosPrivate.get("/associates/",
            {
                params: {
                    limit: 10
                }
            }
            );
            const results = response.data.results;
            setResults(results);
        } catch (error) {
            setErrorMessage("Error fetching residents. Please try again later.");
        }
    };

    useEffect(() => {
        fetchData()
    }, []);

    return (
        <Container fluid className="SearchBarContainer m-3 p-5 border rounded-4">
            <h1 className="mb-5">Choose a resident</h1>
            <SearchBar setResults={setResults}/>
            <SearchResultsList results={results}/>
            <Alert show={errorMessage} className="mt-4 rounded-4 border shadow-sm" variant="danger">
                <Alert.Heading>Error</Alert.Heading>
                {errorMessage}
            </Alert>
        </Container>
    );
}

export default SearchUser;

