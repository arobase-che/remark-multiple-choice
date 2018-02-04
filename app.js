const visit = require('unist-util-visit');

let nbMC = 0;

function dealLabelChildren(listChild) {
  let t = [];
  if (listChild[0].type === 'paragraph') {
    t = listChild[0].children;
  }
  if (listChild[listChild.length - 1].type === 'blockquote') {
    listChild[listChild.length - 1].type = 'div';
    listChild[listChild.length - 1].data = {
      hName: 'blockquote',
      hProperties: {
        className: 'hiden_block_quote',
      },
    };
  }
  t = t.concat(listChild.slice(1));
  return t;
}

function visitList(ast) {
  return visit(ast, 'list', node => {
    let isMultipleChoise = true;
    let nbQ = 0;
    const tab = [];

    Array.from(node.children).forEach(nodeC => {
      if (nodeC.children && nodeC.children[0].type === 'paragraph') {
        if (nodeC.children[0].children && nodeC.children[0].children[0].value) {
          if ('~!='.indexOf(nodeC.children[0].children[0].value[0]) < 0) {
            isMultipleChoise = false;
          }
        } else {
          isMultipleChoise = false;
        }
      } else {
        isMultipleChoise = false;
      }
    });
    if (isMultipleChoise) {
      Array.from(node.children).forEach(nodeC => {
        if (nodeC.children[0].type === 'paragraph') {
          if (nodeC.children[0].children[0].value[0] === '~') {
            tab.push(0.5);
          } else if (nodeC.children[0].children[0].value[0] === '!') {
            tab.push(0);
          } else {
            tab.push(1);
          }
          nodeC.children[0].children[0].value = `${nodeC.children[0].children[0].value.slice(1)}\r`;
        }
      });
      node.type = 'mc';
      node.data = {
        hName: 'fieldset',
        hProperties: {
          className: 'mc check',
          id: `mc_${nbMC}`,
        },
      };
      node.children = [{
        type: 'list-item-mc',
        data: {
          hName: 'ul',
          hProperties: {
            style: 'list-style-type: none',
          },
        },
        children: node.children.map(x => ({type: 'input-list-item',
          data: {
            hName: 'li',
            hProperties: {
              style: 'list-style-type: none',
            },
          },
          children: [
            {type: 'input-list-input',
              data: {
                hName: 'input',
                hProperties: {
                  checked: x.checked,
                  type: 'checkbox',
                  id: `mc_${nbMC}_${nbQ}`,
                  className: '!=~'[tab[nbQ]],
                },
              }},
            {
              type: 'input-list-label',
              data: {
                hName: 'label',
                hProperties: {
                  for: `mc_${nbMC}_${nbQ++}`,
                },
              },
              children: dealLabelChildren(x.children),
            }],
        })),
      }, {type: 'field-button',
        data: {
          hName: 'input',
          hProperties: {
            onclick: `check('mc_${nbMC}',[${String(tab)}])`,
            value: 'Validate',
            type: 'button',
          },
        },

      },
      ];

      nbMC++;
    }
    return node;
  });
}

/**
 * Returns the transformer which acst on the MDAST tree and given VFile.
 *
 * @link https://github.com/unifiedjs/unified#function-transformernode-file-next
 * @link https://github.com/syntax-tree/mdast
 * @link https://github.com/vfile/vfile
 * @return {function}
 */
function multipleChoise() {
  /**
   * @param {object} ast MDAST
   * @param {vFile} vFile
   * @param {function} next
   * @return {object}
   */
  return function (ast, vFile, next) { // Transformer
    visitList(ast);

    if (typeof next === 'function') {
      return next(null, ast, vFile);
    }

    return ast;
  };
}

module.exports = multipleChoise;
