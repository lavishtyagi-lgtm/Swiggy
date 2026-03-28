import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import Header from "./components/Header";
import Body from "./components/Body";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { Contact } from "./components/Contact";
import { Error } from "./components/Error";
import { About } from "./components/About";
import { RestaurantMenu } from "./components/RestaurantMenu";
import { Favourites } from "./components/Favourites";
import { Cart } from "./components/Cart";
import { OrderHistory } from "./components/OrderHistory";
import { SignIn } from "./components/SignIn";
import { CartProvider } from "./utils/CartContext";
import Shimmer from "./components/Shimmer";
import "../index.css";

const Grocery = React.lazy(() => import("./components/Grocery"));

const AppLayout = () => (
  <div className="bg-gray-50 min-h-screen">
    <Header />
    <Outlet />
  </div>
);

const route = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <Error />,
    children: [
      { path: "/",              element: <Body /> },
      { path: "/about",         element: <About /> },
      { path: "/contact",       element: <Contact />, errorElement: <Error /> },
      { path: "/restaurants/:resId", element: <RestaurantMenu /> },
      { path: "/favourites",    element: <Favourites /> },
      { path: "/cart",          element: <Cart /> },
      { path: "/history",       element: <OrderHistory /> },
      { path: "/signin",        element: <SignIn /> },
      {
        path: "/grocery",
        element: (
          <Suspense fallback={<div className="p-10 text-center text-gray-400">Loading...</div>}>
            <Grocery />
          </Suspense>
        ),
      },
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <CartProvider>
    <RouterProvider router={route} />
  </CartProvider>
);
