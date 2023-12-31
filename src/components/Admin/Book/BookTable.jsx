
import React, { useEffect, useState } from 'react';
import { Button, Table, Popconfirm, message, Space, notification } from 'antd';
import InputSearch from './InputSearch';
import { handleGetBookWithPaginate } from '../../../services/api';
import BookDetail from './BookDetail';
import { ReloadOutlined, UserAddOutlined, ExportOutlined, ImportOutlined, EditTwoTone, DeleteTwoTone } from '@ant-design/icons';
import AddNewBook from './AddNewBook';
// import ImportUserData from './data/ImportUserData';
import * as xlsx from "xlsx";
import UpdateBook from './UpdateBook';
import { handleDeleteBook } from '../../../services/api';
import moment from 'moment';

const BookTable = () => {
    const [isLoading, setIsLoading] = useState(false);

    const [allDataBooks, setAllDataBooks] = useState([]);
    const [current, setCurrent] = useState(1);
    const [pageSizeNumber, setPageSizeNumber] = useState(5);
    const [total, setTotal] = useState(0);
    const [filter, setFilter] = useState("");
    const [sortQuery, setSortQuery] = useState("&sort=-updatedAt");

    const [bookInfo, setBookInfo] = useState("");

    const [openDetailBook, setOpenDetailBook] = useState(false);
    const [openModalAddBook, setOpenModalAddBook] = useState(false);
    const [openModalImportData, setOpenImportData] = useState(false);
    const [openModalUpdate, setOpenModalUpdate] = useState(false);
    // const [dataUpdate, setDataUpdate] = useState("");


    const columns = [
        {
            title: 'Name',
            dataIndex: 'mainText',
            render: (text, record, index) => {
                return (
                    <>
                        <a href='#' onClick={() => {
                            setOpenDetailBook(true);
                            setBookInfo(record);
                        }}>
                            {record.mainText}
                        </a>
                    </>
                )
            }

        },
        {
            title: 'Category',
            dataIndex: 'category',
        },
        {
            title: 'Author',
            dataIndex: 'author',
        },
        {
            title: 'Price',
            dataIndex: 'price',
            // defaultSortOrder: 'descend',
            sorter: true,

        },
        {
            title: 'Updated At',
            dataIndex: 'updatedAt',
            defaultSortOrder: 'descend',
            sorter: true,
            render: (text, record, index) => {
                return (
                    <>
                        {moment(record.updatedAt).format('DD-MM-YY HH:mm:ss')}
                    </>
                )
            }

        },
        {
            title: 'Action',
            width: 100,
            render: (text, record, index) => {
                return (
                    <div style={{ textAlign: 'center' }}>
                        <EditTwoTone
                            twoToneColor="#f6910b"
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                                setBookInfo(record)
                                setOpenModalUpdate(true)
                            }}
                        />
                        <Popconfirm
                            placement="topLeft"
                            title="Are you sure to delete this book?"
                            description="Delete the book"
                            onConfirm={() => onClickDeleteBook(record._id)}
                            okText="Yes"
                            cancelText="No"
                        >
                            <span style={{ cursor: 'pointer', margin: "0 20px" }}>
                                <DeleteTwoTone twoToneColor="#ff4d4f" />
                            </span>
                        </Popconfirm>
                    </div>
                )
            }
        },

    ];

    useEffect(() => {
        fetchBookWithPagination();
        // when current or pageSizeNumber has changed, fetchUserWithPagination() will re-call
    }, [current, pageSizeNumber, filter, sortQuery]);


    const onChange = (pagination, filters, sorter, extra) => {
        console.log('params sorter', sorter)
        if (pagination && pagination.current !== current) {
            setCurrent(pagination.current)
        }
        if (pagination && pagination.pageSize !== pageSizeNumber) {
            setPageSizeNumber(pagination.pageSize)
            setCurrent(1);
        }
        if (sorter && sorter.field) {
            const q = sorter.order === 'ascend' ? `&sort=${sorter.field}` : `&sort=-${sorter.field}`;
            setSortQuery(q);
        }

    };

    const searchBook = (querySearch) => {
        setCurrent(1);
        setFilter(querySearch);
    }

    const fetchBookWithPagination = async () => {
        setIsLoading(true);
        let query = `current=${current}&pageSize=${pageSizeNumber}`;
        if (filter) {
            query += `${filter}`;
        }
        if (sortQuery) {
            query += `${sortQuery}`;
        }
        const res = await handleGetBookWithPaginate(query);
        if (res && res.data) {
            let data = res.data.result;
            let dataBooks = [];
            // https://stackoverflow.com/questions/51703111/each-record-in-table-should-have-a-unique-key-prop-or-set-rowkey-to-an-uniqu
            for (let index = 0; index < data.length; index++) {
                const item = data[index];
                const newItem = {
                    ...item,
                    key: index + 1,
                };
                dataBooks.push(newItem);
            }
            setAllDataBooks(dataBooks);
            setTotal(res.data.meta.total)
            setIsLoading(false);
        }

    }

    // const handleExportData = () => {
    //     // https://stackoverflow.com/questions/70871254/how-can-i-export-a-json-object-to-excel-using-nextjs-react
    //     if (dataUser.length > 0) {
    //         const worksheet = xlsx.utils.json_to_sheet(dataUser);
    //         const workbook = xlsx.utils.book_new();
    //         xlsx.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    //         //let buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
    //         //XLSX.write(workbook, { bookType: "xlsx", type: "binary" });
    //         xlsx.writeFile(workbook, "DataUser.csv");
    //     }
    // }

    const onClickDeleteBook = async (id) => {
        const res = await handleDeleteBook(id);
        if (res && res.data) {
            message.success("Delete book successfully!");
            fetchBookWithPagination();
        } else {
            notification.error({
                message: 'Something went wrong...',
                description: res.message
            });
        }
    }

    const renderHeader = () => {
        return (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Table List Books</span>
                <span style={{ display: 'flex', gap: 15 }}>
                    <Button
                        type="primary" icon={<ExportOutlined />}
                    // onClick={() => handleExportData()}
                    >
                        Export
                    </Button>
                    <Button
                        type="primary" icon={<ImportOutlined />}
                        onClick={() => setOpenImportData(true)}
                    >
                        Import
                    </Button>
                    <Button
                        type="primary" icon={<UserAddOutlined />}
                        onClick={() => setOpenModalAddBook(true)}
                    >
                        Add new
                    </Button>
                    <Button type='ghost' onClick={() => {
                        setFilter("")
                        setSortQuery("")
                    }}>
                        <ReloadOutlined />
                    </Button>
                </span>
            </div>
        )
    }

    return (
        <>
            <InputSearch
                searchBook={searchBook}
                setFilter={setFilter}
            />
            <Table
                title={renderHeader}
                loading={isLoading}
                columns={columns}
                dataSource={allDataBooks}
                onChange={onChange}
                pagination={
                    {
                        current: current, pageSize: pageSizeNumber, showSizeChanger: true, total: total,
                        showTotal: (total, range) => { return (<div> {range[0]}-{range[1]} out of {total} rows</div>) }
                    }
                }
            />
            <BookDetail
                bookInfo={bookInfo}
                openDetailBook={openDetailBook}
                setOpenDetailBook={setOpenDetailBook}
            />

            <AddNewBook
                openModalAddBook={openModalAddBook}
                setOpenModalAddBook={setOpenModalAddBook}
                fetchBookWithPagination={fetchBookWithPagination}
            />
            {/* 
            <ImportUserData
                openModalImportData={openModalImportData}
                setOpenImportData={setOpenImportData}
                fetchUserWithPagination={fetchUserWithPagination}
                handleExportData={handleExportData}
            /> */}

            <UpdateBook
                openModalUpdate={openModalUpdate}
                setOpenModalUpdate={setOpenModalUpdate}
                bookInfo={bookInfo}
                fetchBookWithPagination={fetchBookWithPagination}
            />

        </>
    )
}
export default BookTable;