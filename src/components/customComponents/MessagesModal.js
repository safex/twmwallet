import React from "react";
import ReactModal from "react-modal";
import { CgClose } from "react-icons/cg";

export default function MessagesModal({
  isOpen,
  closeFn,
  orderId,
  refreshFn,
  sendFn,
  messages,
}) {
  return (
    <ReactModal
      isOpen={isOpen}
      closeTimeoutMS={500}
      className="buyer-messages-modal"
      onRequestClose={() => closeFn()}
      style={{
        overlay: {
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(255, 255, 255, 0.75)",
        },
        content: {
          position: "absolute",
          top: "12%",
          left: "30%",
        },
      }}
    >
      <>
        <div className="modal-title">
          MESSAGES
          <CgClose
            className="pointer"
            style={{ position: "absolute", right: "15px", color: "red" }}
            size={20}
            onClick={() => closeFn()}
          />
        </div>
        <div className="p-4">
          <div
            className="d-flex flex-column"
            style={{
              borderBottom: "1px solid #e2e2e2",
              paddingBottom: "18px",
            }}
          >
            <div>
              <label>Order ID:</label>
            </div>
            <span>{orderId}</span>
          </div>

          <div className="mt-4 flex-grow-1">
            <div className="d-flex justify-content-between align-items-center">
              <label>Messages</label>
              <button onClick={refreshFn}>Refresh Messages</button>
            </div>
            <div
              style={{
                height: "325px",
                overflow: "overlay",
                marginTop: "10px",
              }}
            >
              {messages}
            </div>
          </div>
          <form onSubmit={e => sendFn(e)}>
            <textarea
              style={{
                fontSize: "1.5rem",
              }}
              rows="6"
              cols="30"
              name="messageBox"
            ></textarea>

            <button
              style={{ height: "45px" }}
              className="my-3 search-button"
              type="submit"
            >
              Send
            </button>
          </form>
        </div>
      </>
    </ReactModal>
  );
}
