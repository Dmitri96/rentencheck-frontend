import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { 
  PayoutContractSchema, 
  PensionContractSchema, 
  AdditionalIncomeSchema,
  formatValidationErrors,
  type PayoutContractData,
  type PensionContractData,
  type AdditionalIncomeData
} from '@/lib/validations/contract-schemas'
import type { RentenblickData } from '@/components/rentenblick-form'

/**
 * Contract management state interface
 * Tracks editing state and form visibility for different contract types
 */
interface ContractManagementState {
  showPayoutForm: boolean
  showPensionForm: boolean
  showIncomeForm: boolean
  editingContract: { type: string; index: number } | null
  validationErrors: Record<string, string>
}

/**
 * Hook return interface providing all contract management functionality
 */
interface UseContractManagementReturn {
  // State
  state: ContractManagementState
  
  // Form data
  payoutForm: PayoutContractData
  pensionForm: PensionContractData
  incomeForm: AdditionalIncomeData
  
  // Form setters
  setPayoutForm: (data: PayoutContractData) => void
  setPensionForm: (data: PensionContractData) => void
  setIncomeForm: (data: AdditionalIncomeData) => void
  
  // CRUD operations
  handleAddPayoutContract: () => void
  handleAddPensionContract: () => void
  handleAddIncomeEntry: () => void
  handleEditContract: (type: string, index: number) => void
  handleSaveEditContract: () => void
  handleRemoveContract: (type: string, index: number) => void
  handleCancelEdit: () => void
  
  // Form visibility
  handleShowPayoutForm: () => void
  handleShowPensionForm: () => void
  handleShowIncomeForm: () => void
}

/**
 * Custom hook for comprehensive contract management
 * 
 * This hook encapsulates all contract-related business logic, providing:
 * - Type-safe CRUD operations for all contract types
 * - Zod-based validation with German error messages
 * - Proper error handling with user feedback via toast notifications
 * - Clean state management with separation of concerns
 * - Accessibility support through proper event handling
 * 
 * @param data - Current form data from parent component
 * @param updateData - Function to update parent form data
 * @param isConfirmed - Whether the form step is confirmed/readonly
 */
export const useContractManagement = (
  data: RentenblickData,
  updateData: (data: Partial<RentenblickData>) => void,
  isConfirmed: boolean
): UseContractManagementReturn => {
  
  // Internal state management for forms and editing
  const [state, setState] = useState<ContractManagementState>({
    showPayoutForm: false,
    showPensionForm: false,
    showIncomeForm: false,
    editingContract: null,
    validationErrors: {}
  })

  // Form data state with proper defaults
  const [payoutForm, setPayoutForm] = useState<PayoutContractData>({
    contract: '',
    company: '',
    contractType: '',
    interestRate: 0,
    maturityYear: new Date().getFullYear(),
    guaranteedAmount: 0,
    projectedAmount: 0
  })

  const [pensionForm, setPensionForm] = useState<PensionContractData>({
    contract: '',
    company: '',
    contractType: '',
    interestRate: 0,
    pensionStartYear: new Date().getFullYear(),
    guaranteedAmount: 0,
    projectedAmount: 0,
    monthlyAmount: 0
  })

  const [incomeForm, setIncomeForm] = useState<AdditionalIncomeData>({
    type: '',
    startYear: new Date().getFullYear(),
    amount: 0,
    frequency: ''
  })

  /**
   * Resets all form data to initial state
   * Used after successful operations or when canceling edits
   */
  const resetFormData = useCallback(() => {
    setPayoutForm({
      contract: '',
      company: '',
      contractType: '',
      interestRate: 0,
      maturityYear: new Date().getFullYear(),
      guaranteedAmount: 0,
      projectedAmount: 0
    })
    
    setPensionForm({
      contract: '',
      company: '',
      contractType: '',
      interestRate: 0,
      pensionStartYear: new Date().getFullYear(),
      guaranteedAmount: 0,
      projectedAmount: 0,
      monthlyAmount: 0
    })
    
    setIncomeForm({
      type: '',
      startYear: new Date().getFullYear(),
      amount: 0,
      frequency: ''
    })
  }, [])

  /**
   * Validates contract data using Zod schemas
   * Returns validation result and sets errors in state for UI display
   */
  const validateContract = useCallback((type: string, formData: any) => {
    try {
      let schema
      switch (type) {
        case 'payout':
          schema = PayoutContractSchema
          break
        case 'pension':
          schema = PensionContractSchema
          break
        case 'income':
          schema = AdditionalIncomeSchema
          break
        default:
          throw new Error('Ungültiger Vertragstyp')
      }

      schema.parse(formData)
      setState(prev => ({ ...prev, validationErrors: {} }))
      return { success: true, data: formData }
    } catch (error: any) {
      const errors = formatValidationErrors(error)
      setState(prev => ({ ...prev, validationErrors: errors }))
      toast.error('Bitte korrigieren Sie die Eingabefehler')
      return { success: false, errors }
    }
  }, [])

  /**
   * Adds a new payout contract with validation and error handling
   */
  const handleAddPayoutContract = useCallback(() => {
    if (isConfirmed) return

    try {
      const validation = validateContract('payout', payoutForm)
      if (!validation.success) return

      updateData({
        payoutContracts: [...data.payoutContracts, payoutForm]
      })

      resetFormData()
      setState(prev => ({ ...prev, showPayoutForm: false }))
      toast.success('Auszahlungsvertrag erfolgreich hinzugefügt - Vergessen Sie nicht, die Daten zu bestätigen!')
    } catch (error) {
      console.error('Error adding payout contract:', error)
      toast.error('Fehler beim Hinzufügen des Vertrags')
    }
  }, [isConfirmed, payoutForm, data.payoutContracts, updateData, validateContract, resetFormData])

  /**
   * Adds a new pension contract with validation and error handling
   */
  const handleAddPensionContract = useCallback(() => {
    if (isConfirmed) return

    try {
      const validation = validateContract('pension', pensionForm)
      if (!validation.success) return

      updateData({
        pensionContracts: [...data.pensionContracts, pensionForm]
      })

      resetFormData()
      setState(prev => ({ ...prev, showPensionForm: false }))
      toast.success('Rentenvertrag erfolgreich hinzugefügt - Vergessen Sie nicht, die Daten zu bestätigen!')
    } catch (error) {
      console.error('Error adding pension contract:', error)
      toast.error('Fehler beim Hinzufügen des Vertrags')
    }
  }, [isConfirmed, pensionForm, data.pensionContracts, updateData, validateContract, resetFormData])

  /**
   * Adds a new additional income entry with validation and error handling
   */
  const handleAddIncomeEntry = useCallback(() => {
    if (isConfirmed) return

    try {
      const validation = validateContract('income', incomeForm)
      if (!validation.success) return

      updateData({
        additionalIncome: [...data.additionalIncome, incomeForm]
      })

      resetFormData()
      setState(prev => ({ ...prev, showIncomeForm: false }))
      toast.success('Zusätzliche Einkunft erfolgreich hinzugefügt - Vergessen Sie nicht, die Daten zu bestätigen!')
    } catch (error) {
      console.error('Error adding income entry:', error)
      toast.error('Fehler beim Hinzufügen der Einkunft')
    }
  }, [isConfirmed, incomeForm, data.additionalIncome, updateData, validateContract, resetFormData])

  /**
   * Initiates editing of an existing contract
   * Populates form with existing data and sets editing state
   */
  const handleEditContract = useCallback((type: string, index: number) => {
    if (isConfirmed) return

    try {
      setState(prev => ({ ...prev, editingContract: { type, index } }))

      switch (type) {
        case 'payout':
          setPayoutForm(data.payoutContracts[index])
          setState(prev => ({ ...prev, showPayoutForm: true }))
          break
        case 'pension':
          setPensionForm(data.pensionContracts[index])
          setState(prev => ({ ...prev, showPensionForm: true }))
          break
        case 'income':
          setIncomeForm(data.additionalIncome[index])
          setState(prev => ({ ...prev, showIncomeForm: true }))
          break
        default:
          throw new Error('Ungültiger Vertragstyp für Bearbeitung')
      }
    } catch (error) {
      console.error('Error starting edit:', error)
      toast.error('Fehler beim Laden der Vertragsdaten')
    }
  }, [isConfirmed, data])

  /**
   * Saves changes to an edited contract with validation
   */
  const handleSaveEditContract = useCallback(() => {
    if (isConfirmed || !state.editingContract) return

    try {
      const { type, index } = state.editingContract

      switch (type) {
        case 'payout': {
          const validation = validateContract('payout', payoutForm)
          if (!validation.success) return

          const updated = [...data.payoutContracts]
          updated[index] = payoutForm
          updateData({ payoutContracts: updated })
          setState(prev => ({ ...prev, showPayoutForm: false }))
          toast.success('Auszahlungsvertrag erfolgreich aktualisiert - Vergessen Sie nicht, die Daten zu bestätigen!')
          break
        }
        case 'pension': {
          const validation = validateContract('pension', pensionForm)
          if (!validation.success) return

          const updated = [...data.pensionContracts]
          updated[index] = pensionForm
          updateData({ pensionContracts: updated })
          setState(prev => ({ ...prev, showPensionForm: false }))
          toast.success('Rentenvertrag erfolgreich aktualisiert - Vergessen Sie nicht, die Daten zu bestätigen!')
          break
        }
        case 'income': {
          const validation = validateContract('income', incomeForm)
          if (!validation.success) return

          const updated = [...data.additionalIncome]
          updated[index] = incomeForm
          updateData({ additionalIncome: updated })
          setState(prev => ({ ...prev, showIncomeForm: false }))
          toast.success('Zusätzliche Einkunft erfolgreich aktualisiert - Vergessen Sie nicht, die Daten zu bestätigen!')
          break
        }
        default:
          throw new Error('Ungültiger Vertragstyp für Speicherung')
      }

      resetFormData()
      setState(prev => ({ ...prev, editingContract: null }))
    } catch (error) {
      console.error('Error saving edited contract:', error)
      toast.error('Fehler beim Speichern der Änderungen')
    }
  }, [isConfirmed, state.editingContract, payoutForm, pensionForm, incomeForm, data, updateData, validateContract, resetFormData])

  /**
   * Removes a contract with confirmation and error handling
   */
  const handleRemoveContract = useCallback((type: string, index: number) => {
    if (isConfirmed) return

    try {
      switch (type) {
        case 'payout':
          updateData({
            payoutContracts: data.payoutContracts.filter((_, i) => i !== index)
          })
          toast.success('Auszahlungsvertrag erfolgreich entfernt')
          break
        case 'pension':
          updateData({
            pensionContracts: data.pensionContracts.filter((_, i) => i !== index)
          })
          toast.success('Rentenvertrag erfolgreich entfernt')
          break
        case 'income':
          updateData({
            additionalIncome: data.additionalIncome.filter((_, i) => i !== index)
          })
          toast.success('Zusätzliche Einkunft erfolgreich entfernt')
          break
        default:
          throw new Error('Ungültiger Vertragstyp für Löschung')
      }
    } catch (error) {
      console.error('Error removing contract:', error)
      toast.error('Fehler beim Entfernen des Vertrags')
    }
  }, [isConfirmed, data, updateData])

  /**
   * Cancels editing and resets all form state
   */
  const handleCancelEdit = useCallback(() => {
    resetFormData()
    setState(prev => ({
      ...prev,
      editingContract: null,
      showPayoutForm: false,
      showPensionForm: false,
      showIncomeForm: false,
      validationErrors: {}
    }))
  }, [resetFormData])

  // Form visibility handlers
  const handleShowPayoutForm = useCallback(() => {
    if (!isConfirmed) {
      setState(prev => ({ ...prev, showPayoutForm: true }))
    }
  }, [isConfirmed])

  const handleShowPensionForm = useCallback(() => {
    if (!isConfirmed) {
      setState(prev => ({ ...prev, showPensionForm: true }))
    }
  }, [isConfirmed])

  const handleShowIncomeForm = useCallback(() => {
    if (!isConfirmed) {
      setState(prev => ({ ...prev, showIncomeForm: true }))
    }
  }, [isConfirmed])

  return {
    // State
    state,
    
    // Form data
    payoutForm,
    pensionForm,
    incomeForm,
    
    // Form setters
    setPayoutForm,
    setPensionForm,
    setIncomeForm,
    
    // CRUD operations
    handleAddPayoutContract,
    handleAddPensionContract,
    handleAddIncomeEntry,
    handleEditContract,
    handleSaveEditContract,
    handleRemoveContract,
    handleCancelEdit,
    
    // Form visibility
    handleShowPayoutForm,
    handleShowPensionForm,
    handleShowIncomeForm
  }
} 