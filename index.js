const fs = (await import("fs")).default;
const { join } = (await import("path")).default;
function is_directory(path) {
    return fs.statSync(path).isDirectory();
}

/**
 *
 * @param {String} path
 * @param {String | null | undefined} extension_string
 * @param {Function | null | undefined} extension_condition_cb
 * @returns {Promise<Object>} promise contains the object of the built library
 *
 * @example
 * export default  (await build(path.join(src_path, 'utils/my_util'),'.my_util_module.js'))
 *
 * @process
 * - build the extension check callback function if not identified
 * - create empty object
 * - read passed directory content
 * - for each element in the directory
 *   - if the element is a directory
 *     - we call the build function recursively with the path joined to the current element
 *       and null extension string and extension cb created
 *   - if not
 *     - we check if the file is an index file, if so we ignore it
 *     - we check if the file satisfies the callback, if so we import it
 */
async function build(path, extension_string, extension_condition_cb) {
    if (extension_condition_cb == undefined) {
        extension_condition_cb = (element) => {
            const index = element.indexOf(extension_string || ".js");
            if (index == -1) {
                return false;
            } else {
                return index;
            }
        };
    }
    const obj = {};
    const path_content = fs.readdirSync(path);
    for (const element of path_content) {
        if (element.includes("index")) {
            continue;
        }
        const joined_path = join(path, element);
        if (is_directory(joined_path)) {
            obj[element] = await build(joined_path, null, extension_condition_cb);
        } else {
            const index = extension_condition_cb(element);
            if (index) {
                obj[element.slice(0, index)] = (await import(joined_path)).default;
            }
        }
    }
    return obj;
}

export default build;
