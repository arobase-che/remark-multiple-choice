const visit = require('unist-util-visit');


const PLUGIN_NAME = 'remark-qcm';

var nb_qcm = 0;

function dealLabelChildren( listChild ) {
  var t = []
  if( listChild[0].type == 'paragraph') {
    t = listChild[0].children
  }
  if(listChild[listChild.length - 1].type == 'blockquote') {
      listChild[listChild.length - 1].type = 'div'
      listChild[listChild.length - 1].data = {
        hName:'blockquote',
        hProperties: {
          className: 'hiden_block_quote'
        }
      }
  }
  t = t.concat(listChild.slice(1))
  return t
}

function visitList(ast, vFile) {
  return visit(ast, 'list', (node, index, parent) => {
    const { position } = node;
    var isQcm = true;
    var nbQ = 0;
    var tab = []

    Array.from(node.children).forEach( ( nodeC ) => {
        if( nodeC.children[0].type == 'paragraph' ) {
          if( "~!=".indexOf(nodeC.children[0].children[0].value[0]) < 0) {
            isQcm = false;
          }
        }
    });
    if( isQcm ) {
      Array.from(node.children).forEach( ( nodeC ) => {
        if( nodeC.children[0].type == 'paragraph' ) {
          if( nodeC.children[0].children[0].value[0] == '~' ) {
            tab.push(0.5);
          }else if(nodeC.children[0].children[0].value[0] == '!') {
            tab.push(0);
          }else {
            tab.push(1);
          }
          nodeC.children[0].children[0].value = nodeC.children[0].children[0].value.slice(1) + '\r';
        }
      })
      node.type = 'qcm'
      node.data = {
          hName: 'fieldset',
          hProperties: {
            className: 'qcm check',
            id: 'qcm_' + nb_qcm
          }
      }
      node.children = [{
        type:'list-item-qcm',
        data: {
          hName: 'ul',
          hProperties:{
              'style': 'list-style-type: none'
          }
        },
        children : node.children.map( (x) => ({type:'input-list-item',
          data: {
            hName: 'li',
            hProperties:{
              'style': 'list-style-type: none'
            }
          },
          children: [
          {type:'input-list-input',
          data: {
            hName: 'input',
            hProperties: {
              checked: x.checked,
              type:'checkbox',
              id: 'qcm_'+nb_qcm+'_'+nbQ,
              className: tab[nbQ] == 0 ? '!' : (tab[nbQ] == 1 ? '=' : '~'),
            }
          }},
            {
            type: 'input-list-label',
            data: {
              hName: 'label',
              hProperties: {
                for: 'qcm_'+nb_qcm+'_'+(nbQ++)
              }
            },
            children: dealLabelChildren(x.children)
          }]
      }) )
      }, {type:'field-button',
        data: {
          hName: 'input',
          hProperties:{
            'onclick': 'check(\'qcm_'+nb_qcm+'\',[' + String(tab) + '])',
            value: 'Validate',
            type:'button'
          }
        }

      }
      ]
        
      nb_qcm++;
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
function qcm() {
  /**
   * @param {object} ast MDAST
   * @param {vFile} vFile
   * @param {function} next
   * @return {object}
   */
  return function transformer(ast, vFile, next) {
    visitList(ast, vFile);

    if (typeof next === 'function') {
      return next(null, ast, vFile);
    }

    return ast;
  };
}

module.exports = qcm;
