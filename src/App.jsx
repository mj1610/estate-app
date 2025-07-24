import HomePage from "./routes/homePage/homePage";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Layout, RequireAuth } from "./routes/layout/layout";
import Login from "./routes/login/login";
import Register from "./routes/register/register";
import ProfileUpdatePage from "./routes/profileUpdatePage/profileUpdatePage";
import NewPostPage from "./routes/newPostPage/newPostPage";
import {
  listPageLoader,
  profilePageLoader,
  singlePageLoader,
} from "./lib/loaders";
import { lazy, Suspense } from "react";

const ListPage = lazy(() => import("./routes/listPage/listPage"));
const ProfilePage = lazy(() => import("./routes/profilePage/profilePage"));
const SinglePage = lazy(() => import("./routes/singlePage/singlePage"));

const Loading = () => <div style={{ padding: "1rem" }}>Loading...</div>;

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          path: "/",
          element: <HomePage />,
        },
        {
          path: "/list",
          element: (
            <Suspense fallback={<Loading />}>
              <ListPage />
            </Suspense>
          ),
          loader: listPageLoader,
        },
        {
          path: "/:id",
          element: (
            <Suspense fallback={<Loading />}>
              <SinglePage />
            </Suspense>
          ),
          loader: singlePageLoader,
        },

        {
          path: "/login",
          element: <Login />,
        },
        {
          path: "/register",
          element: <Register />,
        },
        {
          path: "/about",
          element: <div>About Us</div>,
        },
        {
          path: "/contact",
          element: <div>Contact Us</div>,
        },
        {
          path: "/agents",
          element: <div>Agents</div>,
        },
      ],
    },
    {
      path: "/",
      element: <RequireAuth />,
      children: [
        {
          path: "/profile",
          element: (
            <Suspense fallback={<Loading />}>
              <ProfilePage />
            </Suspense>
          ),
          loader: profilePageLoader,
        },
        {
          path: "/profile/update",
          element: <ProfileUpdatePage />,
        },
        {
          path: "/add",
          element: <NewPostPage />,
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
