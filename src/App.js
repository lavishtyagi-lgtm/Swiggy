import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import Header from "./components/Header";
import Body from "./components/Body";
import { createBrowserRouter , RouterProvider , Outlet } from "react-router-dom";
import {Contact}  from "./components/Contact";
import { Error } from "./components/Error";
import { About } from "./components/About";
import {RestaurantMenu} from "./components/RestaurantMenu";
import Shimmer from "./components/Shimmer";
import "../index.css";
// not using keys (not acceptable in real apps) <<<< index as key <<<<< unique id(best practice)

// 5. App Layout

const Grocery = React.lazy(() => import("./components/Grocery"));
const AppComponent = () => {
  return (
    <div className="bg-white min-h-screen ">
      {/* TEMP: visual test for Tailwind — should be a red bar if Tailwind is working */}
      <Header />
      <Outlet/>
    </div>
  );
};

const route = createBrowserRouter([
  {
    path:'/',
    element:<AppComponent/>,
    children:  [
      {
        path:"/",
        element:<Body/>,
      },
      {
        path:"/about",
        element:<About/>
      },
      {
        path:"/contact",
        element:<Contact/>,
        errorElement:<Error/>
      },
      {
        path:"/restaurants/:resId",
        element:<RestaurantMenu/>
      },
      {
        path:"/grocery",
        element:<Suspense fallback={<div>Loading...<Shimmer/></div>}>
           <Grocery/>
          </Suspense>
      }
    ],
    errorElement:<Error/>,
  }
])

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(< RouterProvider router={route}/>);