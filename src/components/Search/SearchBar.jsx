import {useState} from 'react';
import {FaSearch} from "react-icons/fa";
import "./SearchBar.css";
import {Form, InputGroup} from "react-bootstrap";
import useAxiosPrivate from "@hooks/useAxiosPrivate.jsx";

export const SearchBar = ({setResults}) => {
    const [input, setInput] = useState("");
    const axiosPrivate = useAxiosPrivate();

    const fetchData = async (value) => {
        try {
            const response = await axiosPrivate.get("/associates/", {
                params: {
                    search: value
                }
            });
            const results = response.data.results.filter((user) => {
                return (
                    user &&
                    user.name &&
                    user.name.toLowerCase().includes(value.toLowerCase())
                );
            });
            setResults(results);
        } catch (error) {
            console.error("Error fetching data: ", error);
        }
    };

    const handleChange = (value) => {
        setInput(value);
        fetchData(value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
    };

    return (
        <Form onSubmit={handleSubmit}>
            <InputGroup>
                <InputGroup.Text id="searchIcon">
                    <FaSearch/>
                </InputGroup.Text>
                <Form.Control
                    placeholder="Name of resident"
                    value={input}
                    onChange={(e) => handleChange(e.target.value)}
                />
            </InputGroup>
        </Form>
    );
}

export default SearchBar;
