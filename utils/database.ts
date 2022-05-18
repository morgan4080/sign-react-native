import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import {Asset} from "expo-asset";
import {Platform} from "react-native";
import {Query, SQLiteCallback, SQLTransactionCallback, SQLTransactionErrorCallback} from "expo-sqlite";

async function openDatabase(pathToDatabaseFile: string): Promise<SQLite.WebSQLDatabase> {
    if (Platform.OS === "web") {
        return {
            version: "",
            exec(queries: Query[], readOnly: boolean, callback: SQLiteCallback): void {
            },
            readTransaction(callback: SQLTransactionCallback, errorCallback?: SQLTransactionErrorCallback, successCallback?: () => void): void {
            },
            transaction: () => {
                return {
                    executeSql: () => {},
                };
            }
        };
    }
    if (!(await FileSystem.getInfoAsync(FileSystem.documentDirectory + 'SQLite')).exists) {
        await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'SQLite');
    }
    await FileSystem.downloadAsync(
        Asset.fromModule(require(pathToDatabaseFile)).uri,
        FileSystem.documentDirectory + 'SQLite/identifier.sqlite'
    );
    return SQLite.openDatabase('identifier.sqlite');
}

export const db = openDatabase(`../assets/data/identifier.sqlite`);
