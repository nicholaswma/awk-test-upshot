import { ChangeEvent, useRef, useState } from "react";
import { getArweave } from "../utils/arweaveUtils";

export function UploadFile() {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChangeFile = (event: ChangeEvent<HTMLInputElement>) => {
    setFile(
      !event.target.files
        ? null
        : !event.target.files[0]
        ? null
        : event.target.files[0]
    );
  };

  const handleUpload = () => {
    if (!file) return;

    const uploadFile = async () => {
      const arweave = getArweave();
      const tx = await arweave.createTransaction({
        data: new Uint8Array(await file.arrayBuffer()),
      });
      tx.addTag("Content-Type", file.type);
      tx.addTag("File-Name", file.name);
      const signedTx = await window.arweaveWallet.sign(tx);
      console.log(signedTx);
      const postResult = await arweave.transactions.post(signedTx);
      console.log(postResult);
    };

    uploadFile();
  };

  const handleUploadWithDispatch = () => {
    if (!file) return;

    const uploadFile = async () => {
      const arweave = getArweave();
      const tx = await arweave.createTransaction({
        data: new Uint8Array(await file.arrayBuffer()),
      });
      tx.addTag("Content-Type", file.type);
      tx.addTag("File-Name", file.name);
      const postedTx = await window.arweaveWallet.dispatch(tx);
      console.log(postedTx);
    };

    uploadFile();
  };

  return (
    <div className="flex -mt-2 w-full justify-between items-center space-y-2">
      <input
        className="mt-2"
        type="file"
        ref={fileInputRef}
        onChange={handleChangeFile}
      ></input>
      <div className="inline-flex">
        <button
          className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-50"
          onClick={handleUpload}
        >
          Sign & Post
        </button>
        <button
          className="ml-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-50"
          onClick={handleUploadWithDispatch}
        >
          Dispatch
        </button>
      </div>
    </div>
  );
}
