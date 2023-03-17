import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import {Asset} from "expo-asset";
import {Platform} from "react-native";
import {Query, SQLiteCallback, SQLTransactionCallback, SQLTransactionErrorCallback, WebSQLDatabase} from "expo-sqlite";

export async function openDatabase(): Promise<SQLite.WebSQLDatabase> {
    if (Platform.OS === "web") {
        return {
            closeAsync(): void {
            }, deleteAsync(): Promise<void> {
                return Promise.resolve(undefined);
            },
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
        Asset.fromModule(require('./assets/data/contacts.db')).uri,
        FileSystem.documentDirectory + 'SQLite/contacts.db'
    );
    let database: any = SQLite.openDatabase('contacts.db');
    database._db.close();
    return SQLite.openDatabase('contacts.db');
}
