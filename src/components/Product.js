import { Link, useNavigate } from "react-router-dom";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Rating from "./Rating";
import { useContext } from "react";
import { Store } from "../Store";
import axios from "axios";

function Product(prop) {
  const navigate = useNavigate();
  const { product } = prop;
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const {
    cart: { cartItems },
  } = state;

  const addToCartHandler = async () => {
    const existItem = cartItems.find((x) => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/products/${product._id}`);

    if (data.countInStock < quantity) {
      window.alert("Sorry. Product is out of stock");
      return;
    }

    ctxDispatch({
      type: "CART_ADD_ITEM",
      payload: { ...product, quantity: quantity },
    });
    navigate("/cart");
  };
  return (
    <Card className="product-card">
      <Link to={`/product/${product.id}`} style={{ overflow: 'hidden', display: 'block' }}>
        <img src={product.image} alt={product.name} className="card-img-top homeScreen-card-img" />
      </Link>
      <Card.Body className="d-flex flex-column gap-2 p-3">
        <Link to={`/product/${product.id}`} style={{ color: 'inherit' }}>
          <div className="homescreen-card-title">{product.name}</div>
        </Link>
        <Rating rating={product.rating} reviews={product.numReviews} />
        <div className="product-price mt-auto mb-2">&#x20B9; {product.price}</div>
        {product.countInStock === 0 ? (
          <Button disabled variant="secondary" className="w-100" style={{ borderRadius: '8px' }}>
            Out of Stock
          </Button>
        ) : (
          <Button className="btn-add-cart" onClick={addToCartHandler}>
            Add to Cart
          </Button>
        )}
      </Card.Body>
    </Card>
  );
}

export default Product;
