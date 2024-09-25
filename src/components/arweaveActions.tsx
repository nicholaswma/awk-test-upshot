import { CollapsibleItem } from "./collapsibleItem";
import { UploadFile } from "./uploadFile";

export function ArweaveActions() {
  return (
    <div className="flex flex-col w-[90%] justify-center items-center space-y-4">
      <CollapsibleItem title="Upload a File using Arweave">
        <UploadFile />
      </CollapsibleItem>
      <CollapsibleItem title="Send AR (in Winstons)">
        TODO:{/* <SendAR /> */}
      </CollapsibleItem>
      <CollapsibleItem title="Send an AO Token">
        TODO:{/* <SendAOToken /> */}
      </CollapsibleItem>
      <CollapsibleItem title="Send an AO Message">
        TODO:{/* <SendAOMessage /> */}
      </CollapsibleItem>
      <CollapsibleItem title="Encrypt / Decrypt a Message">
        TODO:{/* <EncryptDecrypt /> */}
      </CollapsibleItem>
    </div>
  );
}
