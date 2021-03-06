import * as path from "path";
import * as inquirer from "inquirer";

import { CliOptions } from "../cli-options";
import packageUtil from "../package-util";
import getRegCore from "../get-reg-core";

interface PluginDescriptor {
  name: string;
  description: string;
}

const WELL_KNOWN_PLUGINS = require(path.join(__dirname, "..", "..", "well-known-plugins.json")) as PluginDescriptor[];

function install(options: CliOptions) {
  const core = getRegCore(options);
  return inquirer.prompt([
    {
      type: "checkbox",
      name: "pluginNamesToInstall",
      message: "Plugin(s) to install",
      choices: WELL_KNOWN_PLUGINS.map(d => ({ name: ` ${d.name} : ${d.description}`, value: d.name })),
    }
  ])
  .then(({ pluginNamesToInstall }: { pluginNamesToInstall: string[] }) => pluginNamesToInstall)
  .then(pluginNamesToInstall => {
    const isCliInstalled = packageUtil.checkInstalledLocalCli();
    if (!isCliInstalled) {
      core.logger.info("This project does not have local installed reg-suit, so install it.");
    }
    if (options.noEmit) return Promise.resolve([]);
    core.logger.info("Install dependencies to the local directory. This procedure takes some minutes, please wait.");
    const spinner = core.logger.getSpinner(`installing dependencies with ${core.logger.colors.green(options.npmClient)}...`);
    spinner.start();
    if (!isCliInstalled) {
      return packageUtil.installPluginAndCli(options.npmClient, pluginNamesToInstall)
      .then(packages => {
        spinner.stop();
        core.logger.verbose(packages.join(", "));
        return packages;
      })
      ;
    } else {
      return packageUtil.installPackages(options.npmClient, pluginNamesToInstall)
      .then(packages => {
        spinner.stop();
        core.logger.verbose(packages.join(", "));
        return packages;
      })
      ;
    }
  })
  ;
}

export default install;
