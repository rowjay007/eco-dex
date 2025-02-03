import { addAliases } from "module-alias";
import "module-alias/register";
import path from "path";

addAliases({
  "@": path.join(__dirname),
});
