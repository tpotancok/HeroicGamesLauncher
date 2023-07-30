import { BottlesType } from 'common/types'
import { ipcMain } from 'electron'
import { getBottlesNames, openBottles } from './utils'

ipcMain.handle(
  'getBottlesNames',
  async (event, bottlesType: BottlesType): Promise<string[]> =>
    getBottlesNames(bottlesType)
)

ipcMain.handle(
  'openBottles',
  async (event, bottlesType: BottlesType, bottle?: string): Promise<void> =>
    openBottles(bottlesType, bottle)
)
