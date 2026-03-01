import Navbar from "./Navbar";
import FoodCategory from "./FoodCategory";
import { useSelector } from "react-redux";
import CityShops from "./CityShops";
import ItemsCard from "./ItemsCard";
import useGetItemsInCity from "../hooks/useGetItemsInCity";
import { useRef, useState } from "react";
import { useEffect } from "react";
import axios from "axios";
import { serverURL } from "../App";

function UserDashboard() {
  const itemsLoading = useGetItemsInCity();
  const [updatedItemList, setUpdatedItemList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchQueryLoading, setSearchQueryLoading] = useState(false);
  const popularSectionRef = useRef(null);

  const { userData, allItemsInCity, city, locationStatus } = useSelector(
    (state) => state.user,
  );

  const handleCategory = (category) => {
    if (!category || category === "All") {
      setUpdatedItemList(allItemsInCity);
    } else {
      const filtered = allItemsInCity.filter(
        (item) => item.category === category,
      );
      setUpdatedItemList(filtered);
    }
  };

  const handleSearch = async (e) => {
    if (e.key !== "Enter") return;

    if (!searchQuery.trim()) {
      setUpdatedItemList(allItemsInCity);
      return;
    }

    try {
      setSearchQueryLoading(true);

      const response = await axios.get(`${serverURL}/api/item/search-items`, {
        params: {
          query: searchQuery,
          city: city,
        },
        withCredentials: true,
      });

      setUpdatedItemList(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setSearchQueryLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery === "" || allItemsInCity?.length > 0) {
      setUpdatedItemList(allItemsInCity);
    }
  }, [allItemsInCity]);

  return (
    <div>
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
      />

      {/* WELCOME SECTION */}
      <div className="w-full px-4 py-8 bg-gradient-to-r from-orange-50 via-orange-100 to-orange-50">
        <div className="max-w-7xl mx-auto">
          <div className="relative overflow-hidden bg-white rounded-2xl shadow-md p-6 md:p-8">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-100 rounded-full"></div>

            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              Hey
              {userData?.fullName ? `, ${userData.fullName.split(" ")[0]}` : ""}
              ! 👋
            </h2>

            <p className="text-gray-600 mt-3 max-w-xl text-sm md:text-base">
              What are you in the mood for today? Fresh meals, tasty snacks, or
              sweet desserts — we’ve got everything ready for you 🍕🍔🍰
            </p>

            <button
              onClick={() =>
                popularSectionRef.current?.scrollIntoView({
                  behavior: "smooth",
                })
              }
              className="mt-5 inline-flex items-center gap-2 bg-orange-500 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-orange-600 transition"
            >
              Explore Food
              <span className="text-lg">🍽️</span>
            </button>
          </div>
        </div>
      </div>

      <FoodCategory onSelectCategory={handleCategory} />
      <CityShops />

      {/* ITEMS SECTION */}
      <div ref={popularSectionRef} className="w-full px-4 py-10 bg-[#fff7f2]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-gray-800">
            Popular Items Near You 🍽️
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* LOCATION / ITEMS LOADING SKELETON */}
            {(locationStatus === "loading" ||
              (locationStatus === "success" && itemsLoading)) && (
              <>
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse"
                  >
                    <div className="h-40 bg-gray-200" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 w-3/4 bg-gray-200 rounded" />
                      <div className="h-3 w-1/2 bg-gray-200 rounded" />
                      <div className="flex justify-between items-center">
                        <div className="h-5 w-16 bg-gray-200 rounded" />
                        <div className="h-8 w-24 bg-gray-200 rounded-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* ITEMS LIST */}
            {locationStatus === "success" &&
              !itemsLoading &&
              updatedItemList?.length > 0 &&
              updatedItemList.map((item) => (
                <ItemsCard key={item._id} item={item} />
              ))}

            {/* EMPTY STATE */}
            {locationStatus === "success" &&
              !itemsLoading &&
              updatedItemList?.length === 0 && (
                <p className="col-span-full text-center text-gray-500">
                  No items available in your city 😔
                </p>
              )}

            {/* LOCATION ERROR */}
            {locationStatus === "error" && (
              <p className="col-span-full text-center text-red-500">
                Unable to detect your location. Please enable GPS 📍
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
