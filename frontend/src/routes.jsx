import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";

const routes = [
	{
		path: "/",
		element: <Home />,
	},
	{
		path: "/payment/success",
		element: <PaymentSuccess />,
	},
	{
		path: "/payment/cancel",
		element: <PaymentCancel />,
	},
	{ path: "*", element: <NotFound /> },
];

export default routes;
