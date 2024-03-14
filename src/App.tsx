import { Fragment, useCallback, useEffect, useMemo, useState } from "react"
import { InputSelect } from "./components/InputSelect"
import { Instructions } from "./components/Instructions"
import { Transactions } from "./components/Transactions"
import { useEmployees } from "./hooks/useEmployees"
import { usePaginatedTransactions } from "./hooks/usePaginatedTransactions"
import { useTransactionsByEmployee } from "./hooks/useTransactionsByEmployee"
import { EMPTY_EMPLOYEE } from "./utils/constants"
import { Employee } from "./utils/types"

export function App() {
  const { data: employees, ...employeeUtils } = useEmployees()
  const { data: paginatedTransactions, ...paginatedTransactionsUtils } = usePaginatedTransactions()
  const { data: transactionsByEmployee, ...transactionsByEmployeeUtils } = useTransactionsByEmployee()
  const [isLoading, setIsLoading] = useState(false)
  const [allTransactions, setAllTransactions] = useState([])
  const [isFilterByEmployee, setIsFilterByEmployee] = useState(false) //BUG 6
  const [employeesLoaded, setEmployeesLoaded] = useState(false) //BUG 5

  const transactions = useMemo(
    //BUG4
    () => (allTransactions.length > 0 ? allTransactions : transactionsByEmployee ?? null),
    [allTransactions, transactionsByEmployee]
  )
  const loadAllTransactions = useCallback(async () => {
    setIsLoading(true)
    transactionsByEmployeeUtils.invalidateData()
    await employeeUtils.fetchAll()
    await paginatedTransactionsUtils.fetchAll()
    setIsLoading(false)
  }, [employeeUtils, paginatedTransactionsUtils, transactionsByEmployeeUtils])

  const loadTransactionsByEmployee = useCallback(
    async (employeeId: string) => {
      paginatedTransactionsUtils.invalidateData()
      await transactionsByEmployeeUtils.fetchById(employeeId)
    },
    [paginatedTransactionsUtils, transactionsByEmployeeUtils]
  )
  const updateTransactionApproval = (transactionId, newValue) => {
    setAllTransactions((currentTransactions) =>
      currentTransactions.map((transaction) =>
        transaction.id === transactionId ? { ...transaction, approved: newValue } : transaction
      )
    )
  }

  useEffect(() => {
    if (employees === null && !employeeUtils.loading) {
      loadAllTransactions()
    }
  }, [employeeUtils.loading, employees, loadAllTransactions])
  useEffect(() => {
    //BUG4
    if (paginatedTransactions?.data?.length > 0 && allTransactions.length > 0) {
      setAllTransactions((prevTransactions) => [...prevTransactions, ...paginatedTransactions.data])
    } else if (paginatedTransactions?.data?.length > 0) {
      setAllTransactions(paginatedTransactions.data)
    }
    console.log(`[App] Transactions updated`, paginatedTransactions)
  }, [paginatedTransactions])
  useEffect(() => {
    //BUG 5
    if (employees !== null) {
      setEmployeesLoaded(true)
    }
  }, [employees])

  return (
    <Fragment>
      <main className="MainContainer">
        <Instructions />

        <hr className="RampBreak--l" />

        <InputSelect<Employee>
          isLoading={!employeesLoaded && employeeUtils.loading} //BUG 5
          defaultValue={EMPTY_EMPLOYEE}
          items={employees === null ? [] : [EMPTY_EMPLOYEE, ...employees]}
          label="Filter by employee"
          loadingLabel="Loading employees"
          parseItem={(item) => ({
            value: item.id,
            label: `${item.firstName} ${item.lastName}`,
          })}
          onChange={async (newValue) => {
            console.log(`[App] Filter by employee changed, new value: `, newValue)

            setAllTransactions([]) //BUG4
            //BUG3
            if (newValue === null || newValue.id === EMPTY_EMPLOYEE.id) {
              setIsFilterByEmployee(false)
              await loadAllTransactions()
            } else {
              setIsFilterByEmployee(true)
              await loadTransactionsByEmployee(newValue.id)
            }
          }}
        />

        <div className="RampBreak--l" />

        <div className="RampGrid">
          <Transactions transactions={transactions} />
          <p>this</p>
          {transactions !== null && !isFilterByEmployee && paginatedTransactions?.nextPage !== null && (
            <button
              className="RampButton"
              disabled={paginatedTransactionsUtils.loading}
              onClick={async () => {
                await loadAllTransactions()
              }}
            >
              View More
            </button>
          )}
        </div>
      </main>
    </Fragment>
  )
}
