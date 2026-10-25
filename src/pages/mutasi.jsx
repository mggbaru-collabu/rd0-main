import { useState } from "react";

function isCredit(value) {
  return ["TRSF E-BANKING CR", "SWITCHING CR", "BI-FAST CR"].includes(
    value.trim().toUpperCase()
  );
}

function isDebit(value) {
  return ["TRSF E-BANKING DB", "SWITCHING DB", "BI-FAST DB"].includes(
    value.trim().toUpperCase()
  );
}

export default function App() {
  const [text, setText] = useState("");
  const [value, setValue] = useState([]);
  const [type, setType] = useState("BRI");

  const onFormat = function () {
    let result = [];
    switch (type) {
      case "BRI":
        result = text.split("\n").reduce((prev, current, index) => {
          const rowIndex = index - Math.ceil(index / 2);
          if (index % 2 === 0) {
            let name = current.split("\t")[1];
            if (name.startsWith("TRANSFER FROM")) {
              name = name.split(" ")[1].substring(4);
            } else if (name.startsWith("TRANSFER NBMB")) {
              name = name.split(" TO ")[0].substring("14");
            } else if (name.startsWith("TRANSFER EDC")) {
              name = name.split(" TO ")[0].substring("9");
            } else if (name.startsWith("TRANSFER ATM")) {
              name = name.split(" TO ")[0].substring("13");
            } else if (name.startsWith("TRANSAKSI KREDIT DARI BANK LAIN")) {
              name = name.split("#EDC#")[0].substring("10");
            } else if (name.startsWith("BFST")) {
              name = name.split(" :")[0].replaceAll(/\d/g, "").substring(4);
            } else if (name.indexOf("LINK AJA") >= 0) {
              name = "LINK AJA";
            }
            prev[rowIndex] = [name];
          } else {
            const number = current
              .split(" ")[0]
              .split(",")[0]
              .replaceAll(".", "");
            prev[rowIndex].push(
              Math.trunc(parseInt(number, 10) / 1000).toString()
            );
            prev[rowIndex].push(number);
          }
          return prev;
        }, []);
        break;
      case "BNI":
        result = text
          .split("\n")
          .reverse()
          .map((txt) => {
            const [_1, _name, _2, _amount] = txt.split("\t");
            const number = _amount.split(".")[0].replaceAll(",", "");
            let name = _name;
            if (name.startsWith("TRF/PAY/TOP-UP")) {
              name = name.replaceAll("TRF/PAY/TOP-UP ", "");
            } else if (name.startsWith("TRANSFER DARI VISIONET")) {
              name = "VISIONET INTERNASIONAL OVO";
            } else if (
              name.startsWith("TRANSFER DARI Sdr") ||
              name.startsWith("TRANSFER DARI Bpk")
            ) {
              name = name.substring(18);
            } else if (
              name.startsWith("TRANSFER DARI FINTEK KARYA NUSANTARA LINKAJA")
            ) {
              name = "FINTEK KARYA NUSANTARA LINKAJA";
            } else if (name.startsWith("TRANSFER DARI DOMPET ANAK BANGSA ")) {
              name = "DOMPET ANAK BANGSA";
            } else if (name.startsWith("TRANSFER DARI ESPAY DEBIT INDONESIA")) {
              name = "ESPAY DEBIT INDONESIA";
            }

            if (name.match(/BNI\d/)) {
              name = name.split(" BNI")[0];
            }
            if (name.match(/ Xxx/)) {
              name = name.split(" Xxx")[0];
            }
            name = name.replaceAll("Sdr ", "");
            name = name.replaceAll("TRANSFER DARI ", "");
            name = name.replaceAll(" Deposit", "");

            return [
              name,
              Math.trunc(parseInt(number, 10) / 1000).toString(),
              number,
            ];
          });
        break;
      case "BCA":
        let temp = [];
        let sign = "";
        let release = false;
        text.split("\n").forEach((value, index, arr) => {
          if (isDebit(value) || isCredit(value)) {
            release = true;
          } else {
            temp.push(value);
          }
          if (arr.length === index + 1) {
            release = true;
          }
          if (!!release) {
            release = false;
            if (temp.length > 0) {
              const txt = temp.join("\n");
              const [_name, _amount] = txt.split(txt.match(/\n\d\d\d\d\n/gm));
              const number = _amount
                .split(".")[0]
                .replaceAll(",", "")
                .replaceAll("\n", "")
                .replaceAll("\t", "")
                .trim();
              const credit = Math.trunc(parseInt(number, 10) / 1000).toString();
              let name = _name;

              const transferDrRegExp = /^TRANSFER DR (\d*) (.*)/gm;
              const tglMobileBncReqExp =
                /^TANGGAL :\d\d\/\d\d TRANSFER DR (\d*) (.*)\n(.*)/gm;
              const transferKeRegExp =
                /^(TRANSFER KE|BIAYA TXN KE) (.*?) (.*) M-BCA/gm;

              if (_name.match(tglMobileBncReqExp)) {
                name = _name.replace(tglMobileBncReqExp, "$2");
              } else if (_name.match(/\n-\n-/gm)) {
                name = _name.split("\n")[4];
              } else if (_name.match(transferDrRegExp)) {
                name = _name.replace(transferDrRegExp, "$2");
                if (name.indexOf(" NEW ") >= 0) {
                  name = name.substring(0, name.indexOf(" NEW "));
                }
              } else if (_name.match(/(\d*)\/(.*)\/(.*)\n(\d*)\.\d\d/gm)) {
                const _temp = _name.split("\n");
                if (_temp[_temp.length - 3].startsWith("TRFDN-")) {
                  name = _temp[_temp.length - 3].replaceAll("TRFDN-", "");
                } else {
                  name = _temp[_temp.length - 2];
                }
              } else if (_name.match(/\d\d\/\d\d (.*)\n/gm)) {
                const _temp = _name.split("\n");
                name = _temp[_temp.length - 2];
              } else if (_name.match(transferKeRegExp)) {
                name = _name.replace(transferKeRegExp, "$3");
              }
              name = name.replaceAll("\n", "").replaceAll("\t", "");

              const printSign = sign === "DB" ? "-" : "";

              result.push([name, printSign + credit, printSign + number]);
              temp = [];
            }
          }

          if (isCredit(value)) {
            sign = "CR";
          } else if (isDebit(value)) {
            sign = "DB";
          }
        });
        break;
      default:
        break;
    }
    setValue(result);
  };

  function onCopy() {
    navigator.clipboard.writeText(
      value.map((row) => row.join("\t")).join("\n")
    );
  }

  return (
    <>
      <div>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="BRI">BRI</option>
          <option value="BNI">BNI</option>
          <option value="BCA">BCA</option>
        </select>
        <div className="App">
          <div className="left">
            <textarea
              style={{ height: 100 }}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
              }}
            ></textarea>
          </div>
          <button onClick={onFormat}>{`Format >>>`}</button>
          <div className="right">
            <button className="copy" onClick={onCopy}>
              COPY
            </button>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Credit</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {value.map(([name, credit, amount], index) => (
                  <tr key={index}>
                    <td>{name}</td>
                    <td>{credit}</td>
                    <td>{amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <style jsx>{`
        .App {
          font-family: sans-serif;
          text-align: center;
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }

        th,
        td {
          border: 1px solid grey;
        }
        table {
          border: 1px solid grey;
        }

        .copy {
          margin-bottom: 8px;
          height: 30px;
        }

        div.left {
          flex: 1;
        }
        div.right {
          flex: 2;
        }

        div.right > *,
        div.left > * {
          width: 100%;
        }
      `}</style>
    </>
  );
}
