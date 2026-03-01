import axios from "axios";
import { useEffect } from "react";
import { serverURL } from "../App";
import { useDispatch, useSelector } from "react-redux";
import { setShopData } from "../redux/ownerSlice";

function useGetShop() {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);

  useEffect(() => {
    
    if (!userData) return;

    const fetchShop = async () => {
      try {
        const response = await axios.get(
          `${serverURL}/api/shop/get-shop`,
          { withCredentials: true }
        );

        dispatch(setShopData(response.data));
      } catch (error) {
        console.log("Get shop error:", error.response?.data || error.message);
      }
    };

    fetchShop();
  }, [userData]); // ✅ correct dependency
}

export default useGetShop;
