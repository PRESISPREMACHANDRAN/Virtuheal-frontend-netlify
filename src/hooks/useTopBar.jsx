import {useContext} from "react";
import TopBarContext from "@contexts/TopBarContext";

const useTopBar = () => {
    return useContext(TopBarContext);
}
export default useTopBar;