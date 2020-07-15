import React, { useContext } from "react";

import Card from "../../shared/components/UIElements/Card";
import PlaceItem from "./PlaceItem";
import { AuthContext } from "../../shared/context/auth-context";
import Button from "../../shared/components/FormElements/Button";
import "./PlaceList.css";

const PlaceList = (props) => {
  const auth = useContext(AuthContext);
  if (props.items.length === 0) {
    return (
      <div className="place-list center">
        <Card>
          {auth.isLoggedIn  ? (
            <div>
              <h2>No places found. Maybe create one?</h2>
              <Button to="/places/new">Share Place</Button>
            </div>
          ) : (
            <h2>No places found.</h2>
          )}
        </Card>
      </div>
    );
  }

  return (
    <ul className="place-list">
      {props.items.map((place) => (

        <PlaceItem
          key={place.id}
          id={place.id}
          image={place.image}
          title={place.title}
          description={place.description}
          address={place.address}
          creatorId={place.creator}
          coordinates={place.location}
          onDelete={props.onDeletePlace}
        />
      ))}
    </ul>
  );
};

export default PlaceList;
