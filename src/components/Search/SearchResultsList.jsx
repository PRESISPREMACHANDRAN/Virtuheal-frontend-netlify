import "./SearchResultsList.css";
import {useNavigate} from "react-router-dom";

const SearchResult = ({result}) => {
    const navigate = useNavigate();
    return (
        <div
            className="searchResult"
            onClick={() => {
                navigate('/reports/add/upload', {state: {id: result.id, url: result.url, name: result.name}});
            }}
        >
            {result.name}
        </div>
    );
}


export const SearchResultsList = ({results}) => {
    return (
        <div className="resultsList">
            {results.map((result, id) => (
                <SearchResult result={result} key={id}/>
            ))}
        </div>
    );
}
