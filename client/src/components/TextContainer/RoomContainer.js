import React from 'react';
import './TextContainer.css';

const RoomContainer = ({ rooms }) => {
  let params = new URL(document.location).searchParams;
  let user = params.get('name');

  return (
    <div className="textContainer">
      {rooms ? (
        <div>
          <h1>Rooms currently open:</h1>
          <div className="activeContainer">
            <h2>
              {rooms.map(({ name }) => (
                <div key={name} className="activeItem">
                  <a href={`/chat?name=${user}&room=${name}`}>{name}</a>
                </div>
              ))}
            </h2>
          </div>
        </div>
      ) : null}
    </div>
  );
};
export default RoomContainer;
