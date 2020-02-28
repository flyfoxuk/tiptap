import { Node } from 'tiptap'
import {
  tableEditing,
  columnResizing,
  goToNextCell,
  addColumnBefore,
  addColumnAfter,
  deleteColumn,
  addRowBefore,
  addRowAfter,
  deleteRow,
  deleteTable,
  mergeCells,
  splitCell,
  toggleHeaderColumn,
  toggleHeaderRow,
  toggleHeaderCell,
  setCellAttr,
  fixTables,

  isInTable,
  selectionCell,

} from 'prosemirror-tables'
import { createTable } from 'prosemirror-utils'
import { TextSelection } from 'prosemirror-state'
import TableNodes from './TableNodes'

export default class Table extends Node {

  get name() {
    return 'table'
  }

  get defaultOptions() {
    return {
      resizable: false,
    }
  }

  get schema() {
    return TableNodes.table
  }

  commands({ schema }) {
    return {
      createTable: ({ rowsCount, colsCount, withHeaderRow }) => (
        (state, dispatch) => {
          const offset = state.tr.selection.anchor + 1

          const nodes = createTable(schema, rowsCount, colsCount, withHeaderRow)
          const tr = state.tr.replaceSelectionWith(nodes).scrollIntoView()
          const resolvedPos = tr.doc.resolve(offset)

          tr.setSelection(TextSelection.near(resolvedPos))

          dispatch(tr)
        }
      ),
      addColumnBefore: () => addColumnBefore,
      addColumnAfter: () => addColumnAfter,
      deleteColumn: () => deleteColumn,
      addRowBefore: () => addRowBefore,
      addRowAfter: () => addRowAfter,
      deleteRow: () => deleteRow,
      deleteTable: () => deleteTable,
      toggleCellMerge: () => (
          (state, dispatch) => {
            if (mergeCells(state, dispatch)) {
              return
            }
            splitCell(state, dispatch)
          }
      ),
      mergeCells: () => mergeCells,
      splitCell: () => splitCell,
      toggleHeaderColumn: () => toggleHeaderColumn,
      toggleHeaderRow: () => toggleHeaderRow,
      toggleHeaderCell: () => toggleHeaderCell,
      setCellAttr: () => setCellAttr,
      fixTables: () => fixTables,
      getCellAttr: () => (
        (state, dispatch) => {
            if (!isInTable(state)) return false
            let $cell = selectionCell(state)
            console.log('************** $cell', $cell)
            // if ($cell.nodeAfter.attrs[name] === value) return false
            // if (dispatch) {
            //   let tr = state.tr
            //   if (state.selection instanceof CellSelection)
            //     state.selection.forEachCell((node, pos) => {
            //       if (node.attrs[name] !== value)
            //         tr.setNodeMarkup(pos, null, setAttr(node.attrs, name, value))
            //     })
            //   else
            //     tr.setNodeMarkup($cell.pos, null, setAttr($cell.nodeAfter.attrs, name, value))
            //   dispatch(tr)
            // }
            return true
          }
      )
    }
  }

  keys() {
    return {
      Tab: goToNextCell(1),
      'Shift-Tab': goToNextCell(-1),
    }
  }

  get plugins() {
    return [
      ...(this.options.resizable ? [columnResizing()] : []),
      tableEditing(),
    ]
  }

}
