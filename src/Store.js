import { useReducer } from "react";
import { createContext } from "react";

export const Store = createContext();

function withIsAdmin(userInfo) {
  if (!userInfo) return userInfo;
  return { ...userInfo, isAdmin: userInfo.role === "ADMIN" };
}

const initialState = {
  cart: {
    cartItems: localStorage.getItem("cartItems")
      ? JSON.parse(localStorage.getItem("cartItems"))
      : [],
      shippingAddress: localStorage.getItem("shippingAddress")
      ? JSON.parse(localStorage.getItem("shippingAddress"))
      : {},
      paymentMethod: localStorage.getItem("paymentMethod")
      ? JSON.parse(localStorage.getItem("paymentMethod"))
      : null,
       
  },
  userInfo:
     localStorage.getItem("userInfo")
      ? withIsAdmin(JSON.parse(localStorage.getItem("userInfo")))
      : null,

};
function reducer(state, action) {
  switch (action.type) {
    case "CART_ADD_ITEM":
      const newItem = action.payload;
      const existItem = state.cart.cartItems.find(
        (item) => item.id === newItem.id
      );
      const cartItems = existItem
        ? state.cart.cartItems.map((item) =>
            item.id === existItem.id ? newItem : item
          )
        : [...state.cart.cartItems, newItem];

        localStorage.setItem("cartItems", JSON.stringify(cartItems));
      return { ...state, cart: { ...state.cart, cartItems } };

    case "CART_REMOVE_ITEM": {
      const cartItems = state.cart.cartItems.filter(
        (item) => item.id !== action.payload.id
      );

      localStorage.setItem("cartItems", JSON.stringify(cartItems));
      return { ...state, cart: { ...state.cart, cartItems } };
    }
    case "USER_SIGNIN": {
      const userInfo = withIsAdmin(action.payload);
      localStorage.setItem('userInfo', JSON.stringify(userInfo))

      return { ...state, userInfo };
    }
    case "CART_CLEAR": {
      localStorage.removeItem('cartItems');
      
      return { ...state, cart:{...state.cart, cartItems: [] } };
    }
    case "USER_SIGNUP": {
      const userInfo = withIsAdmin(action.payload);
      localStorage.setItem('userInfo', JSON.stringify(userInfo))

      return { ...state, userInfo };
    }
    case "USER_PROFILE_UPDATE": {
      const userInfo = withIsAdmin(action.payload);
      localStorage.setItem('userInfo', JSON.stringify(userInfo))

      return { ...state, userInfo };
    }
    case "USER_SIGNOUT": {
      localStorage.removeItem('userInfo');
      localStorage.removeItem('shippingAddress');
      localStorage.removeItem('paymentMethod');
     
      return { ...state, userInfo: null, cart: {cartItems: [],  shippingAddress: {}, paymentMethod: null} };
    }
    case "SAVE_SHIPPING_ADDRESS": {
      localStorage.setItem('shippingAddress', JSON.stringify(action.payload));
     
      return { ...state, cart: {...state.cart,  shippingAddress: action.payload}};
    }
    case "ADD_PAYMENT_METHOD": {
      localStorage.setItem('paymentMethod', JSON.stringify(action.payload));
     
      return { ...state, cart: {...state.cart,  paymentMethod: action.payload}};
    }

    default:
      return state;
  }
}

export function StoreProvider(props) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = { state, dispatch };

  return <Store.Provider value={value}>{props.children}</Store.Provider>;
}
