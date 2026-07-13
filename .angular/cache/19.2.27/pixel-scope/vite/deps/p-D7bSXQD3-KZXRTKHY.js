import {
  c,
  m
} from "./chunk-4H436YDE.js";
import {
  e
} from "./chunk-AOBGQV5T.js";
import {
  H,
  P
} from "./chunk-PXVS5CB6.js";
import {
  __async
} from "./chunk-WDMUDEB6.js";

// node_modules/@ionic/core/components/p-D7bSXQD3.js
var i = () => {
  const i2 = window;
  i2.addEventListener("statusTap", () => {
    H(() => {
      const o = document.elementFromPoint(i2.innerWidth / 2, i2.innerHeight / 2);
      if (!o) return;
      const n = m(o);
      n && new Promise((o2) => e(n, o2)).then(() => {
        P(() => __async(null, null, function* () {
          n.style.setProperty("--overflow", "hidden"), yield c(n, 300), n.style.removeProperty("--overflow");
        }));
      });
    });
  });
};
export {
  i as startStatusTap
};
/*! Bundled license information:

@ionic/core/components/p-D7bSXQD3.js:
  (*!
   * (C) Ionic http://ionicframework.com - MIT License
   *)
*/
//# sourceMappingURL=p-D7bSXQD3-KZXRTKHY.js.map
