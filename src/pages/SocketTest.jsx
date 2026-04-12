import { useEffect, useState } from "react";
import {
  connect,
  disconnect,
  joinDoc,
  onDocumentUpdate,
  sendDocumentUpdate,
} from "../socket";

export default function SocketTest() {
  const [log, setLog] = useState([]);
  const documentId = "PINGROOM";

  useEffect(() => {
    connect();

    joinDoc(documentId, (ack) => {
      setLog((p) => [`JOIN ACK ${JSON.stringify(ack)}`, ...p]);
    });

    onDocumentUpdate((msg) => {
      setLog((p) => [`RECV ${JSON.stringify(msg)}`, ...p]);
    });

    return () => disconnect();
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h1>Socket test</h1>
      <button
        onClick={() => {
          sendDocumentUpdate(
            { documentId, title: "ping", content: "hello " + Date.now() },
            (ack) => setLog((p) => [`UPDATE ACK ${JSON.stringify(ack)}`, ...p])
          );
          setLog((p) => ["SENT ping", ...p]);
        }}
      >
        Send ping
      </button>

      <pre style={{ whiteSpace: "pre-wrap" }}>{log.join("\n")}</pre>
    </div>
  );
}